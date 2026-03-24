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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Row */}
      <div className="hidden overflow-hidden rounded-t-[12px] bg-[#00253E] text-white lg:block">
        <div className="grid grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] border-b border-gray-700">
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#D0DDE8]">
            {t('german')}
          </div>
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em]">
            {t('triggerAiPromptHeader')}
          </div>
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#ECF2CB]">
            {t('english')}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="w-full space-y-0">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:gap-0 lg:py-0"
          >
            {/* German Side */}
            <div className="flex min-h-[260px] flex-col gap-2 bg-[#D0DDE8] p-4 lg:rounded-none lg:p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#00253E] opacity-60">
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
            <div className="order-first flex items-center justify-center lg:order-none">
              <div className="flex min-h-[92px] w-full max-w-[180px] flex-col items-center justify-center rounded-[10px] border border-[#BADA55] bg-[#BADA55] px-4 py-4 text-center shadow-[0_8px_18px_rgba(186,218,85,0.22)]">
                <span className="max-w-[130px] text-[18px] font-semibold leading-[1.08] text-[#00253E] uppercase">
                  {field.name}
                </span>
                <span className="mt-2 rounded-full border border-[#00253E]/10 bg-white/55 px-3 py-[5px] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00253E]/70">
                  AI Prompt
                </span>
              </div>
            </div>

            {/* English Side */}
            <div className="flex min-h-[260px] flex-col gap-2 bg-[#ECF2CB] p-4 lg:rounded-none lg:p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#00253E] opacity-60">
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
      <div className="flex justify-end pt-2">
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
