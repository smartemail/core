import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { App } from 'antd'
import { kebabCase } from 'lodash'
import { templatesApi } from '../../../services/api/template'
import { broadcastApi } from '../../../services/api/broadcast'
import { pricingApi, type SubscriptionPlanResponse } from '../../../services/api/pricing'
import { userSettingService } from '../../../services/api/user_setting'
import { contactsApi } from '../../../services/api/contacts'
import { listsApi } from '../../../services/api/list'
import { listSegments, type Segment } from '../../../services/api/segment'
import { emailBuilderApi, type EmailBuilderResponse, type EmailBuilderTrendsResponse } from '../../../services/api/email_builder'
import { convertMjmlToJsonBrowser } from '../../mjml-converter/mjml-to-json-browser'
import { parseDocument } from 'htmlparser2'
import { default as serialize } from 'dom-serializer'
import type { EmailBlock } from '../../email_builder/types'
import { CREDIT_COSTS, type CampaignStep } from '../constants'
import type { Template, Workspace } from '../../../services/api/types'

export interface UploadedImage {
  uid: string
  name: string
  size: number
  url: string
  thumbUrl?: string
}

export interface BrandingData {
  businessName: string
  websiteUrl: string
  logoUrl: string | null
  brandColors: string[]
  companyDescription: string
  audienceDescription: string
  companyAddress: string
}

export interface CreditBreakdown {
  label: string
  cost: number
}

export interface CampaignWizardReturn {
  // Workspace
  workspaceId: string

  // Navigation
  currentStep: CampaignStep
  goToStep: (step: CampaignStep) => void
  goNext: () => void
  goPrevious: () => void
  validateStep: () => boolean

  // Step 1: Content
  prompt: string
  setPrompt: (v: string) => void
  trendingEnabled: boolean
  setTrendingEnabled: (v: boolean) => void
  trends: EmailBuilderTrendsResponse[]
  trendsLoading: boolean
  selectedTrend: EmailBuilderTrendsResponse | null
  setSelectedTrend: (v: EmailBuilderTrendsResponse | null) => void
  isEventInvitation: boolean
  setIsEventInvitation: (v: boolean) => void
  eventDateTime: string
  setEventDateTime: (v: string) => void
  eventLocation: string
  setEventLocation: (v: string) => void
  addButton: boolean
  setAddButton: (v: boolean) => void
  buttonName: string
  setButtonName: (v: string) => void
  buttonLink: string
  setButtonLink: (v: string) => void
  stylingSource: 'branding' | 'preset'
  setStylingSource: (v: 'branding' | 'preset') => void
  websiteUrl: string
  setWebsiteUrl: (v: string) => void
  selectedPreset: string | null
  setSelectedPreset: (v: string | null) => void
  selectedPalette: string | null
  setSelectedPalette: (v: string | null) => void
  generateImages: boolean
  setGenerateImages: (v: boolean) => void
  uploadCustomImages: boolean
  setUploadCustomImages: (v: boolean) => void
  uploadedImages: UploadedImage[]
  setUploadedImages: (v: UploadedImage[]) => void

  // Generation
  isGenerated: boolean
  isGenerating: boolean
  visualEditorTree: EmailBlock | null
  setVisualEditorTree: (v: EmailBlock | null) => void
  generatedResult: EmailBuilderResponse | null
  handleGenerate: () => Promise<void>

  // Editor
  isEditing: boolean
  setIsEditing: (v: boolean) => void

  // Credits
  creditEstimate: { total: number; breakdown: CreditBreakdown[] }

  // Step 2: Settings
  campaignName: string
  setCampaignName: (v: string) => void
  subjectLine: string
  setSubjectLine: (v: string) => void
  subjectPreview: string
  setSubjectPreview: (v: string) => void
  audience: string[]
  setAudience: (v: string[]) => void
  segments: Segment[]
  segmentsLoading: boolean
  regenerateSubject: () => Promise<void>
  regeneratePreview: () => Promise<void>
  refreshUrl: () => Promise<void>
  extracting: boolean

  // Sending (in modal)
  scheduleForLater: boolean
  setScheduleForLater: (v: boolean) => void
  scheduledDate: string | null
  setScheduledDate: (v: string | null) => void
  scheduledTime: string | null
  setScheduledTime: (v: string | null) => void

  // Modals
  showCreditModal: boolean
  setShowCreditModal: (v: boolean) => void
  showSendModal: boolean
  setShowSendModal: (v: boolean) => void
  showAuthModal: boolean
  setShowAuthModal: (v: boolean) => void

  // Preview
  compiledHtml: string
  setCompiledHtml: (v: string) => void
  previewMode: 'desktop' | 'mobile'
  setPreviewMode: (v: 'desktop' | 'mobile') => void
  isCompiling: boolean
  setIsCompiling: (v: boolean) => void

  // Data
  brandingData: BrandingData | null
  subscription: SubscriptionPlanResponse | null
  totalContacts: number | undefined
  contactsLoading: boolean
  refreshContacts: () => Promise<void>

  // Guest mode
  isGuestMode: boolean

  // Save/Launch
  isSaving: boolean
  saveDraft: () => Promise<void>
  launch: () => Promise<void>
  createdTemplateId: string | null
  createdBroadcastId: string | null,
  searchTrends: (v: string) => Promise<void>
}

const STEP_ORDER: CampaignStep[] = ['content', 'settings']

// --- Draft persistence ---
const DRAFT_KEY = 'campaign_draft'

interface CampaignDraft {
  // Content step
  prompt: string
  trendingEnabled: boolean
  selectedTrend: EmailBuilderTrendsResponse | null
  isEventInvitation: boolean
  eventDateTime: string
  eventLocation: string
  addButton: boolean
  buttonName: string
  buttonLink: string
  stylingSource: 'branding' | 'preset'
  websiteUrl: string
  selectedPreset: string | null
  selectedPalette: string | null
  generateImages: boolean
  uploadCustomImages: boolean
  uploadedImages: UploadedImage[]
  // Generated content
  visualEditorTree: EmailBlock | null
  generatedResult: EmailBuilderResponse | null
  compiledHtml: string
  isGenerated: boolean
  // Settings step
  campaignName: string
  subjectLine: string
  subjectPreview: string
  // Navigation
  currentStep: CampaignStep
}

function loadDraft(): CampaignDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraftToStorage(draft: CampaignDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

function clearDraftStorage() {
  localStorage.removeItem(DRAFT_KEY)
}

export function useCampaignWizard(
  workspace: Workspace,
  existingTemplate?: Template,
  isGuestMode = false,
): CampaignWizardReturn {
  const { message } = App.useApp()
  const navigate = useNavigate()

  // Edit mode: parse existing template tree
  const existingTree = useMemo(() => {
    if (!existingTemplate?.email?.visual_editor_tree) return null
    const tree = existingTemplate.email.visual_editor_tree
    if (typeof tree === 'object') return tree as unknown as EmailBlock
    try { return JSON.parse(tree) as EmailBlock } catch { return null }
  }, [existingTemplate])

  // Load draft from localStorage (skip when editing existing template)
  const draft = existingTemplate ? null : loadDraft()

  // Navigation — skip to settings if editing existing template
  const [currentStep, setCurrentStep] = useState<CampaignStep>(
    existingTemplate ? 'settings' : (draft?.currentStep ?? 'content')
  )

  // Step 1: Content — priority: sessionStorage (from HomePage) > localStorage draft > default
  const [prompt, setPrompt] = useState(() => {
    const stored = sessionStorage.getItem('pending_prompt')
    if (stored) {
      sessionStorage.removeItem('pending_prompt')
      return stored
    }
    return draft?.prompt ?? ''
  })
  const [trendingEnabled, setTrendingEnabled] = useState(draft?.trendingEnabled ?? false)
  const [trends, setTrends] = useState<EmailBuilderTrendsResponse[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<EmailBuilderTrendsResponse | null>(draft?.selectedTrend ?? null)
  const [trendsFetched, setTrendsFetched] = useState(false)
  const [isEventInvitation, setIsEventInvitation] = useState(draft?.isEventInvitation ?? false)
  const [eventDateTime, setEventDateTime] = useState(draft?.eventDateTime ?? '')
  const [eventLocation, setEventLocation] = useState(draft?.eventLocation ?? '')
  const [addButton, setAddButton] = useState(draft?.addButton ?? false)
  const [buttonName, setButtonName] = useState(draft?.buttonName ?? '')
  const [buttonLink, setButtonLink] = useState(draft?.buttonLink ?? '')
  const [stylingSource, setStylingSource] = useState<'branding' | 'preset'>(
    draft?.stylingSource ?? (isGuestMode ? 'preset' : 'branding')
  )
  const [websiteUrl, setWebsiteUrl] = useState(draft?.websiteUrl ?? '')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(draft?.selectedPreset ?? null)
  const [selectedPalette, setSelectedPalette] = useState<string | null>(draft?.selectedPalette ?? 'classic-blue')
  const [generateImages, setGenerateImages] = useState(draft?.generateImages ?? false)
  const [uploadCustomImages, setUploadCustomImages] = useState(draft?.uploadCustomImages ?? false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(draft?.uploadedImages ?? [])

  // Extracting
  const [extracting, setExtracting] = useState(false)

  // Generation
  const [isGenerated, setIsGenerated] = useState(!!existingTree || (draft?.isGenerated ?? false))
  const [isGenerating, setIsGenerating] = useState(false)
  const [visualEditorTree, setVisualEditorTree] = useState<EmailBlock | null>(existingTree ?? draft?.visualEditorTree ?? null)
  const [generatedResult, setGeneratedResult] = useState<EmailBuilderResponse | null>(draft?.generatedResult ?? null)

  // Step 2: Settings
  const [campaignName, setCampaignName] = useState(existingTemplate?.name || draft?.campaignName || '')
  const [subjectLine, setSubjectLine] = useState(existingTemplate?.email?.subject || draft?.subjectLine || '')
  const [subjectPreview, setSubjectPreview] = useState(existingTemplate?.email?.subject_preview || draft?.subjectPreview || '')
  const [audience, setAudience] = useState<string[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [segmentsLoading, setSegmentsLoading] = useState(false)
  // Sending (modal)
  const [scheduleForLater, setScheduleForLater] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const [scheduledTime, setScheduledTime] = useState<string | null>('11:00')

  // Editor
  const [isEditing, setIsEditing] = useState(false)

  // Modals
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Preview
  const [compiledHtml, setCompiledHtml] = useState(draft?.compiledHtml ?? '')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isCompiling, setIsCompiling] = useState(false)

  // Auto-save draft to localStorage on any wizard state change
  useEffect(() => {
    if (existingTemplate) return
    saveDraftToStorage({
      prompt, trendingEnabled, selectedTrend, isEventInvitation,
      eventDateTime, eventLocation, addButton, buttonName, buttonLink,
      stylingSource, websiteUrl, selectedPreset, selectedPalette,
      generateImages, uploadCustomImages, uploadedImages,
      visualEditorTree, generatedResult, compiledHtml, isGenerated,
      campaignName, subjectLine, subjectPreview,
      currentStep,
    })
  }, [
    existingTemplate, prompt, trendingEnabled, selectedTrend,
    isEventInvitation, eventDateTime, eventLocation,
    addButton, buttonName, buttonLink,
    stylingSource, websiteUrl, selectedPreset, selectedPalette,
    generateImages, uploadCustomImages, uploadedImages,
    visualEditorTree, generatedResult, compiledHtml, isGenerated,
    campaignName, subjectLine, subjectPreview,
    currentStep,
  ])

  // Data
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionPlanResponse | null>(null)
  const [totalContacts, setTotalContacts] = useState<number | undefined>(undefined)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [defaultListId, setDefaultListId] = useState<string>('')

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(existingTemplate?.id || null)
  const [createdBroadcastId, setCreatedBroadcastId] = useState<string | null>(null)

  // Credit estimation — fixed at 15 credits per generation
  const creditEstimate = useMemo(() => {
    const breakdown: CreditBreakdown[] = [
      { label: 'Generation', cost: 15 },
    ]
    return { total: 15, breakdown }
  }, [])

  // Fetch trending hooks when enabled
  {/*
  useEffect(() => {
    if (isGuestMode) return
    if (trendingEnabled && !trendsFetched) {
      setTrendsLoading(true)
      emailBuilderApi.trends()
        .then((result) => {
          setTrends(result || [])
          setTrendsFetched(true)
        })
        .catch((error) => {
          console.error('Failed to fetch trends:', error)
        })
        .finally(() => {
          setTrendsLoading(false)
        })
    }
  }, [trendingEnabled, trendsFetched])
  */}

  // Handle trending toggle
  const handleSetTrendingEnabled = useCallback((v: boolean) => {
    setTrendingEnabled(v)
    if (!v) {
      setSelectedTrend(null)
    }
  }, [])

  const refreshContacts = useCallback(async () => {
    setContactsLoading(true)
    try {
      const result = await contactsApi.getTotalContacts({ workspace_id: workspace.id })
      setTotalContacts(result.total_contacts)
    } catch (error) {
      console.error('Failed to fetch contacts count:', error)
    } finally {
      setContactsLoading(false)
    }
  }, [workspace.id])

  // Fetch initial data on mount
  useEffect(() => {
    if (isGuestMode) return

    const fetchData = async () => {
      // Fetch settings and subscription independently so one failure doesn't block the other
      try {
        const settingsResult = await userSettingService.getUserSettings()
        const findSetting = (code: string) => settingsResult.find((s: { code: string }) => s.code === code)?.value || ''
        const colorsRaw = findSetting('brand_colors')
        let brandColors: string[] = []
        try {
          const parsed = colorsRaw ? JSON.parse(colorsRaw) : []
          if (Array.isArray(parsed)) {
            brandColors = parsed
          } else if (typeof parsed === 'string' && parsed) {
            brandColors = parsed.split(',').map((c: string) => c.trim()).filter((c: string) => /^#[0-9A-Fa-f]{3,8}$/.test(c))
          }
        } catch {
          brandColors = colorsRaw ? colorsRaw.split(',').map((c: string) => c.trim()).filter((c: string) => /^#[0-9A-Fa-f]{3,8}$/.test(c)) : []
        }

        const savedWebsiteUrl = findSetting('website_url')
        setBrandingData({
          businessName: findSetting('business_name'),
          websiteUrl: savedWebsiteUrl,
          logoUrl: findSetting('logo') || null,
          brandColors,
          companyDescription: findSetting('services'),
          audienceDescription: findSetting('audience'),
          companyAddress: findSetting('company_address'),
        })

        if (savedWebsiteUrl) {
          setWebsiteUrl(savedWebsiteUrl)
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error)
      }

      try {
        const subResult = await pricingApi.subscription()
        setSubscription(subResult)
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    const fetchSegments = async () => {
      setSegmentsLoading(true)
      try {
        const result = await listSegments({ workspace_id: workspace.id, with_count: true })
        setSegments(result.segments || [])
      } catch (error) {
        console.error('Failed to fetch segments:', error)
      } finally {
        setSegmentsLoading(false)
      }
    }

    const fetchLists = async () => {
      try {
        const result = await listsApi.list({ workspace_id: workspace.id })
        const fetchedLists = result.lists || []
        if (fetchedLists.length > 0) {
          setDefaultListId(fetchedLists[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch lists:', error)
      }
    }

    fetchData()
    refreshContacts()
    fetchSegments()
    fetchLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.id])

  // Navigation
  const goToStep = useCallback((step: CampaignStep) => {
    setCurrentStep(step)
  }, [])

  const goNext = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep)
    if (idx < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[idx + 1])
    }
  }, [currentStep])

  const goPrevious = useCallback(() => {
    const idx = STEP_ORDER.indexOf(currentStep)
    if (idx > 0) {
      setCurrentStep(STEP_ORDER[idx - 1])
    }
  }, [currentStep])

  const validateStep = useCallback((): boolean => {
    if (currentStep === 'content') {
      if (!existingTemplate && !prompt.trim()) {
        message.warning('Please enter your email content message')
        return false
      }
      if (!isGenerated || !visualEditorTree) {
        message.warning('Please generate an email first')
        return false
      }
      return true
    }
    if (currentStep === 'settings') {
      if (!campaignName.trim()) {
        message.warning('Please enter a campaign name')
        return false
      }
      if (!subjectLine.trim()) {
        message.warning('Please enter a subject line')
        return false
      }
      return true
    }
    return true
  }, [currentStep, prompt, isGenerated, visualEditorTree, campaignName, subjectLine, message])

  // Build style and website values based on styling source
  const getStyleParams = useCallback(() => {
    let style = ''
    let website = ''

    if (stylingSource === 'preset') {
      style = selectedPreset || ''
    } else {
      // 'branding' — use websiteUrl or saved branding URL
      website = websiteUrl || brandingData?.websiteUrl || ''
    }

    return { style, website }
  }, [stylingSource, selectedPreset, brandingData, websiteUrl])

  // AI Generation
  const handleGenerate = useCallback(async () => {
    if (isGuestMode) {
      setShowAuthModal(true)
      return
    }

    if (!prompt.trim()) {
      message.warning('Please enter your email content message')
      return
    }

    setShowCreditModal(false)
    setIsGenerating(true)
    try {
      const { style, website } = getStyleParams()
      const result = await emailBuilderApi.generate({
        message: prompt,
        trendKey: selectedTrend?.trend || '',
        trendDescription: selectedTrend?.description || '',
        addLinkButton: addButton,
        addLinkButtonName: buttonName,
        addLinkButtonLink: buttonLink,
        addEvent: isEventInvitation,
        addEventDateTime: eventDateTime,
        addEventLocation: eventLocation,
        website,
        style,
        isGenerateImage: generateImages,
        isUploadCustomImage: uploadCustomImages,
        files: uploadedImages.map((img) => img.url),
      })

      setGeneratedResult(result)

      const doc = parseDocument(result.mgml, { xmlMode: true })
      const serialized = serialize(doc, { xmlMode: true })
      const emailTree = convertMjmlToJsonBrowser(serialized)

      setVisualEditorTree(emailTree)
      setIsGenerated(true)

      // Pre-fill settings from AI result
      const subject = result.subject_line || result.copy?.subject
      if (subject) {
        setSubjectLine(subject)
      }
      const preview = result.subject_preview || result.copy?.preheader
      if (preview) {
        setSubjectPreview(preview)
      }
      if (result.company_name && !campaignName) {
        setCampaignName(result.company_name)
      }
    } catch (error: unknown) {
      console.error('Failed to generate email:', error)
      message.error((error as Error)?.message || 'Failed to generate email')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, selectedTrend, addButton, buttonName, buttonLink, isEventInvitation, eventDateTime, eventLocation, getStyleParams, generateImages, uploadCustomImages, uploadedImages, message])

  // Regenerate subject line
  const regenerateSubject = useCallback(async () => {
    if (!prompt.trim()) return
    try {
      const { style, website } = getStyleParams()
      const result = await emailBuilderApi.generate({
        message: prompt,
        trendKey: selectedTrend?.trend || '',
        trendDescription: selectedTrend?.description || '',
        addLinkButton: addButton,
        website,
        style,
      })
      const subject = result.subject_line || result.copy?.subject
      if (subject) {
        setSubjectLine(subject)
      }
    } catch (error: unknown) {
      console.error('Failed to regenerate subject:', error)
      message.error((error as Error)?.message || 'Failed to regenerate subject line')
    }
  }, [prompt, selectedTrend, addButton, getStyleParams, message])

  // Regenerate preview text
  const regeneratePreview = useCallback(async () => {
    if (!prompt.trim()) return
    try {
      const { style, website } = getStyleParams()
      const result = await emailBuilderApi.generate({
        message: prompt,
        trendKey: selectedTrend?.trend || '',
        trendDescription: selectedTrend?.description || '',
        addLinkButton: addButton,
        website,
        style,
      })
      const preview = result.subject_preview || result.copy?.preheader
      if (preview) {
        setSubjectPreview(preview)
      }
    } catch (error: unknown) {
      console.error('Failed to regenerate preview:', error)
      message.error((error as Error)?.message || 'Failed to regenerate subject preview')
    }
  }, [prompt, selectedTrend, addButton, getStyleParams, message])

  // Refetch branding data from server
  const refetchBranding = useCallback(async () => {
    try {
      const settingsResult = await userSettingService.getUserSettings()
      const findSetting = (code: string) => settingsResult.find((s: { code: string }) => s.code === code)?.value || ''
      const colorsRaw = findSetting('brand_colors')
      let colors: string[] = []
      try {
        const parsed = colorsRaw ? JSON.parse(colorsRaw) : []
        colors = Array.isArray(parsed) ? parsed : []
      } catch {
        colors = colorsRaw ? colorsRaw.split(',').map((c: string) => c.trim()) : []
      }
      setBrandingData({
        businessName: findSetting('business_name'),
        websiteUrl: findSetting('website_url'),
        logoUrl: findSetting('logo') || null,
        brandColors: colors,
        companyDescription: findSetting('services'),
        audienceDescription: findSetting('audience'),
        companyAddress: findSetting('company_address'),
      })
    } catch (error) {
      console.error('Failed to refetch branding:', error)
    }
  }, [])

  // Save website URL + extract all branding info via AI
  const refreshUrl = useCallback(async () => {
    if (!websiteUrl.trim()) {
      message.warning('Please enter a URL first')
      return
    }
    setExtracting(true)
    try {
      await userSettingService.updateUserSettings([
        { code: 'website_url', value: websiteUrl },
      ])
      // Extract all branding info (backend saves to DB and handles logo upload)
      await userSettingService.extractWebsiteInfo(websiteUrl)
      // Refetch to get resolved values (e.g., uploaded logo URL)
      await refetchBranding()
      message.success('Branding extracted')
    } catch (error: unknown) {
      console.error('Failed to extract branding:', error)
      message.error((error as Error)?.message || 'Failed to extract branding')
    } finally {
      setExtracting(false)
    }
  }, [websiteUrl, message, refetchBranding])

  // Save draft - returns the broadcast ID for immediate use by callers
  const saveDraft = useCallback(async (): Promise<string | undefined> => {
    if (!visualEditorTree || !campaignName.trim()) return undefined

    setIsSaving(true)
    try {
      const templateId = createdTemplateId || kebabCase(campaignName) || 'campaign-' + Date.now()

      const defaultTestData = {
        contact: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
        },
      }

      const templatePayload = {
        workspace_id: workspace.id,
        id: templateId,
        name: campaignName,
        channel: 'email',
        category: 'marketing',
        email: {
          subject: subjectLine,
          subject_preview: subjectPreview,
          visual_editor_tree: visualEditorTree,
          compiled_preview: compiledHtml,
        },
        test_data: defaultTestData,
      }

      if (createdTemplateId) {
        await templatesApi.update(templatePayload)
      } else {
        const result = await templatesApi.create(templatePayload)
        setCreatedTemplateId(result.template.id)
      }

      const broadcastPayload = {
        workspace_id: workspace.id,
        name: campaignName,
        audience: audience.length === 0
          ? { list: defaultListId, exclude_unsubscribed: true }
          : { list: defaultListId, segments: audience, exclude_unsubscribed: true },
        schedule: {
          is_scheduled: false,
          use_recipient_timezone: false,
        },
        test_settings: {
          enabled: false,
          sample_percentage: 100,
          auto_send_winner: false,
          variations: [{ variation_name: 'default', template_id: createdTemplateId || templateId }],
        },
        utm_parameters: {
          source: 'email',
          medium: 'email',
          campaign: kebabCase(campaignName),
        },
      }

      let broadcastId = createdBroadcastId
      if (createdBroadcastId) {
        await broadcastApi.update({ ...broadcastPayload, id: createdBroadcastId })
      } else {
        const result = await broadcastApi.create(broadcastPayload)
        broadcastId = result.broadcast.id
        setCreatedBroadcastId(broadcastId)
      }

      message.success('Draft saved')
      clearDraftStorage()
      return broadcastId
    } catch (error: unknown) {
      console.error('Failed to save draft:', error)
      message.error((error as Error)?.message || 'Failed to save draft')
      return undefined
    } finally {
      setIsSaving(false)
    }
  }, [
    visualEditorTree, campaignName, subjectLine, subjectPreview, compiledHtml,
    audience, defaultListId, workspace.id, createdTemplateId, createdBroadcastId, message,
  ])

  // Launch
  const launch = useCallback(async () => {
    setIsSaving(true)
    try {
      const broadcastId = await saveDraft()

      if (!broadcastId) {
        message.error('Failed to create broadcast')
        return
      }

      const sendNow = !scheduleForLater

      await broadcastApi.schedule({
        workspace_id: workspace.id,
        id: broadcastId,
        send_now: sendNow,
        scheduled_date: !sendNow ? (scheduledDate || undefined) : undefined,
        scheduled_time: !sendNow ? (scheduledTime || undefined) : undefined,
        timezone: !sendNow ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      })

      message.success(sendNow ? 'Campaign sent!' : 'Campaign scheduled!')
      clearDraftStorage()
      setShowSendModal(false)
      navigate({
        to: '/workspace/$workspaceId/broadcasts',
        params: { workspaceId: workspace.id },
      })
    } catch (error: unknown) {
      console.error('Failed to launch campaign:', error)
      message.error((error as Error)?.message || 'Failed to launch campaign')
    } finally {
      setIsSaving(false)
    }
  }, [saveDraft, workspace.id, scheduleForLater, scheduledDate, scheduledTime, message, navigate])

  const searchTrends = useCallback((query: string) => {
    if (!trendingEnabled) return
    setTrendsLoading(true)
    emailBuilderApi.trends({ message: query,})
      .then((result) => {
        setTrends(result || [])
      })
      .catch((error) => {
        console.error('Failed to search trends:', error)
      })
      .finally(() => {
        setTrendsLoading(false)
      })
  }, [trendingEnabled])

  return {
    workspaceId: workspace.id,

    currentStep,
    goToStep,
    goNext,
    goPrevious,
    validateStep,

    prompt, setPrompt,
    trendingEnabled, setTrendingEnabled: handleSetTrendingEnabled,
    trends, trendsLoading,
    selectedTrend, setSelectedTrend,
    isEventInvitation, setIsEventInvitation,
    eventDateTime, setEventDateTime,
    eventLocation, setEventLocation,
    addButton, setAddButton,
    buttonName, setButtonName,
    buttonLink, setButtonLink,
    stylingSource, setStylingSource,
    websiteUrl, setWebsiteUrl,
    selectedPreset, setSelectedPreset,
    selectedPalette, setSelectedPalette,
    generateImages, setGenerateImages,
    uploadCustomImages, setUploadCustomImages,
    uploadedImages, setUploadedImages,

    isGenerated,
    isGenerating,
    visualEditorTree,
    setVisualEditorTree,
    generatedResult,
    handleGenerate,

    isEditing, setIsEditing,

    creditEstimate,

    campaignName, setCampaignName,
    subjectLine, setSubjectLine,
    subjectPreview, setSubjectPreview,
    audience, setAudience,
    segments, segmentsLoading,
    regenerateSubject,
    regeneratePreview,
    refreshUrl,
    extracting,

    scheduleForLater, setScheduleForLater,
    scheduledDate, setScheduledDate,
    scheduledTime, setScheduledTime,

    showCreditModal, setShowCreditModal,
    showSendModal, setShowSendModal,
    showAuthModal, setShowAuthModal,

    compiledHtml, setCompiledHtml,
    previewMode, setPreviewMode,
    isCompiling, setIsCompiling,

    brandingData,
    subscription,
    totalContacts,
    contactsLoading,
    refreshContacts,

    isGuestMode,

    isSaving,
    saveDraft,
    launch,
    createdTemplateId,
    createdBroadcastId,
    searchTrends,
  }
}
