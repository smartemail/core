import { PromptSection } from '../sections/PromptSection'
import { StylingSourceSection } from '../sections/StylingSourceSection'
// import { ImagerySection } from '../sections/ImagerySection'
import { GenerateButton } from '../sections/GenerateButton'
import type { CampaignWizardReturn } from '../hooks/useCampaignWizard'

interface ContentStepProps {
  wizard: CampaignWizardReturn
}

export function ContentStep({ wizard }: ContentStepProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <PromptSection
          prompt={wizard.prompt}
          onPromptChange={wizard.setPrompt}
          isEventInvitation={wizard.isEventInvitation}
          onEventInvitationChange={wizard.setIsEventInvitation}
          eventDateTime={wizard.eventDateTime}
          onEventDateTimeChange={wizard.setEventDateTime}
          eventLocation={wizard.eventLocation}
          onEventLocationChange={wizard.setEventLocation}
          addButton={wizard.addButton}
          onAddButtonChange={wizard.setAddButton}
          buttonName={wizard.buttonName}
          onButtonNameChange={wizard.setButtonName}
          buttonLink={wizard.buttonLink}
          onButtonLinkChange={wizard.setButtonLink}
          trendingEnabled={wizard.trendingEnabled}
          onTrendingEnabledChange={wizard.setTrendingEnabled}
          trends={wizard.trends}
          trendsLoading={wizard.trendsLoading}
          selectedTrend={wizard.selectedTrend}
          onSelectedTrendChange={wizard.setSelectedTrend}
          isGuestMode={wizard.isGuestMode}
          searchTrends={wizard.searchTrends}
        />

        <StylingSourceSection
          workspaceId={wizard.workspaceId}
          stylingSource={wizard.stylingSource}
          onStylingSourceChange={wizard.setStylingSource}
          websiteUrl={wizard.websiteUrl}
          onWebsiteUrlChange={wizard.setWebsiteUrl}
          onRefreshUrl={wizard.refreshUrl}
          selectedPreset={wizard.selectedPreset}
          onSelectedPresetChange={wizard.setSelectedPreset}
          selectedPalette={wizard.selectedPalette}
          onSelectedPaletteChange={wizard.setSelectedPalette}
          brandingData={wizard.brandingData}
          extracting={wizard.extracting}
          isGuestMode={wizard.isGuestMode}
        />

        {/* <ImagerySection
          generateImages={wizard.generateImages}
          onGenerateImagesChange={wizard.setGenerateImages}
          uploadCustomImages={wizard.uploadCustomImages}
          onUploadCustomImagesChange={wizard.setUploadCustomImages}
          uploadedImages={wizard.uploadedImages}
          onUploadedImagesChange={wizard.setUploadedImages}
        /> */}
      </div>

      {/* Fixed generate button */}
      <div style={{ padding: 10, borderTop: '1px solid #E4E4E4', flexShrink: 0 }}>
        <GenerateButton
          isGenerated={wizard.isGenerated}
          isGenerating={wizard.isGenerating}
          disabled={!wizard.prompt.trim()}
          creditCost={wizard.creditEstimate.total}
          creditsTotal={wizard.subscription?.credits_left ?? null}
          isGuestMode={wizard.isGuestMode}
          onClick={wizard.isGuestMode ? () => wizard.setShowAuthModal(true) : wizard.handleGenerate}
        />
      </div>
    </div>
  )
}
