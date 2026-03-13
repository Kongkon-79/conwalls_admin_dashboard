/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SystemSettings, MeasureType } from '@/types/settings'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(() => import('@/components/ui/tiptap-editor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] bg-white rounded-[4px] border border-[#E2E8F0] animate-pulse" />
  ),
})

interface TriggerAiPromptControlProps {
  settings: SystemSettings | null
  onUpdate: () => void
}

const TriggerAiPromptControl = ({
  settings,
  onUpdate,
}: TriggerAiPromptControlProps) => {
  const t = useTranslations('common')
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, reset, setValue } = useForm<{
    triggerAiPrompt: MeasureType[]
  }>({
    defaultValues: {
      triggerAiPrompt: [],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'triggerAiPrompt',
  })

  const watchedFields = useWatch({ control, name: 'triggerAiPrompt' })

  // Sync with settings data when it loads
  useEffect(() => {
    if (settings && settings.triggerAiPrompt) {
      reset({ triggerAiPrompt: settings.triggerAiPrompt })
    }
  }, [settings, reset])

  const onSubmit = async (values: { triggerAiPrompt: MeasureType[] }) => {
    if (!settings?._id) return

    try {
      setIsSubmitting(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting/${settings._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            triggerAiPrompt: values.triggerAiPrompt,
          }),
        },
      )

      if (!res.ok) {
        throw new Error('Failed to update trigger AI prompt')
      }

      toast.success('Trigger AI prompt updated successfully!')
      onUpdate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">
        {t('noTriggerAiPromptFound')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      {/* Header Row */}
      <div className="bg-[#00253E] text-white overflow-hidden rounded-t-[8px]">
        <div className="grid grid-cols-[1fr_200px_1fr] border-b border-gray-700">
          <div className="py-3 px-4 text-center font-bold text-sm uppercase text-[#D0DDE8]">
            {t('german')}
          </div>
          <div className="py-3 px-4 text-center font-bold text-sm uppercase">
            {t('triggerAiPromptHeader')}
          </div>
          <div className="py-3 px-4 text-center font-bold text-sm uppercase text-[#ECF2CB]">
            {t('english')}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-0 w-full overflow-x-auto">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_200px_1fr] items-stretch gap-6 py-4"
          >
            {/* German Side */}
            <div className="bg-[#D0DDE8] p-4 flex flex-col gap-2 rounded-[4px]">
              <span className="text-[11px] text-[#00253E] uppercase font-semibold opacity-60 tracking-wider">
                {t('promptLabel')} (DE)
              </span>
              <TiptapEditor
                value={watchedFields?.[index]?.values?.de ?? ''}
                onChange={(html) =>
                  setValue(`triggerAiPrompt.${index}.values.de`, html, {
                    shouldDirty: true,
                  })
                }
                placeholder={t('germanPromptPlaceholder')}
              />
            </div>

            {/* Middle — name badge */}
            <div className="flex items-center justify-center py-4">
              <div className="bg-[#BADA55] w-full min-h-[64px] py-4 flex items-center justify-center rounded-[4px] text-center px-4 shadow-sm border border-[#BADA55]">
                <span className="text-[18px] font-semibold text-[#00253E] leading-[110%] uppercase">
                  {field.name}
                </span>
              </div>
            </div>

            {/* English Side */}
            <div className="bg-[#ECF2CB] p-4 flex flex-col gap-2 rounded-[4px]">
              <span className="text-[11px] text-[#00253E] uppercase font-semibold opacity-60 tracking-wider">
                {t('promptLabel')} (EN)
              </span>
              <TiptapEditor
                value={watchedFields?.[index]?.values?.en ?? ''}
                onChange={(html) =>
                  setValue(`triggerAiPrompt.${index}.values.en`, html, {
                    shouldDirty: true,
                  })
                }
                placeholder={t('englishPromptPlaceholder')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-[#00253E] font-bold px-10 h-11 rounded-[4px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </div>
    </form>
  )
}

export default TriggerAiPromptControl
