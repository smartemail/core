import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Segmented, Tooltip } from 'antd'
import { faDesktop, faMobileAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface PreviewProps {
  html: string
  mjml: string
  errors?: any[]
  testData?: any
  onTestDataChange: (testData: any) => void
  mobileDesktopSwitcherRef?: React.RefObject<HTMLDivElement>
  forceMobileView?: boolean
}

export interface PreviewRef {
  openTemplateDataEditor: () => void
  closeTemplateDataEditor: () => void
  isTemplateDataEditorOpen: () => boolean
  getTemplateData: () => any
  setTemplateData: (data: any) => void
  getTemplateDataTabRef: () => HTMLElement | null
}

export const Preview = forwardRef<PreviewRef, PreviewProps>(
  ({ html, testData, onTestDataChange, mobileDesktopSwitcherRef, forceMobileView }, ref) => {
    const [mobileView, setMobileView] = useState(true)
    const effectiveMobileView = forceMobileView || mobileView

    // Expose methods through ref
    useImperativeHandle(
      ref,
      () => ({
        openTemplateDataEditor: () => {},
        closeTemplateDataEditor: () => {},
        isTemplateDataEditorOpen: () => false,
        getTemplateData: () => testData,
        setTemplateData: (data: any) => {
          if (onTestDataChange) {
            onTestDataChange(data)
          }
        },
        getTemplateDataTabRef: () => null
      }),
      [testData, onTestDataChange]
    )

    return (
      <div className="h-full">
        <div
          className="flex flex-col relative h-full"
          style={{
            background:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACqADAAQAAAABAAAACgAAAAA7eLj1AAAAK0lEQVQYGWP8DwQMaODZs2doIgwMTBgiOAQGUCELNodLSUlhuHQA3Ui01QDcPgnEE5wAOwAAAABJRU5ErkJggg==")'
          }}
        >
          {/* Floating Mobile/Desktop Switcher (hidden when forced mobile) */}
          {!forceMobileView && (
            <div className="absolute top-4 right-4 z-10">
              <div ref={mobileDesktopSwitcherRef}>
                <Segmented
                  value={effectiveMobileView ? 'mobile' : 'desktop'}
                  onChange={(value) => setMobileView(value === 'mobile')}
                  options={[
                    {
                      label: (
                        <Tooltip title="Mobile view (400px)">
                          <FontAwesomeIcon icon={faMobileAlt} />
                        </Tooltip>
                      ),
                      value: 'mobile'
                    },
                    {
                      label: (
                        <Tooltip title="Desktop view (100%)">
                          <FontAwesomeIcon icon={faDesktop} />
                        </Tooltip>
                      ),
                      value: 'desktop'
                    }
                  ]}
                  size="small"
                />
              </div>
            </div>
          )}
          <div
            className="flex-1"
            style={{
              width: forceMobileView ? '100%' : (effectiveMobileView ? '400px' : '100%'),
              margin: forceMobileView ? '0' : (effectiveMobileView ? '20px auto' : '0')
            }}
          >
            <iframe
              srcDoc={html}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    )
  }
)
