import { useEffect, useRef, useCallback } from 'react'
import { templatesApi } from '../../../services/api/template'
import type { EmailBlock } from '../../email_builder/types'

interface UseEmailPreviewProps {
  visualEditorTree: EmailBlock | null
  workspaceId: string
  onCompiledHtml: (html: string) => void
  onIsCompiling: (v: boolean) => void
}

export function useEmailPreview({
  visualEditorTree,
  workspaceId,
  onCompiledHtml,
  onIsCompiling,
}: UseEmailPreviewProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const compilePreview = useCallback(async (tree: EmailBlock) => {
    onIsCompiling(true)
    try {
      const response = await templatesApi.compile({
        workspace_id: workspaceId,
        message_id: 'preview',
        visual_editor_tree: tree,
        test_data: {
          contact: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
          },
        },
        channel: 'email',
      })

      if (response.html) {
        onCompiledHtml(response.html)
      }
    } catch (error) {
      console.error('Failed to compile preview:', error)
    } finally {
      onIsCompiling(false)
    }
  }, [workspaceId, onCompiledHtml, onIsCompiling])

  // Auto-compile with debounce when tree changes
  useEffect(() => {
    if (!visualEditorTree) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      compilePreview(visualEditorTree)
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [visualEditorTree, compilePreview])

  return { compilePreview }
}
