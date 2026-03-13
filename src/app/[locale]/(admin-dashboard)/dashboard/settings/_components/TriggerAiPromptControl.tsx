/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SystemSettings, MeasureType } from '@/types/settings'

import { useTranslations } from 'next-intl'

interface TriggerAiPromptControlProps {
  settings: SystemSettings | null
  onUpdate: () => void
}

const TriggerAiPromptControl = ({ settings, onUpdate }: TriggerAiPromptControlProps) => {
  const t = useTranslations('common')
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, handleSubmit, reset } = useForm<{
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

      <div className="space-y-0 w-full overflow-x-auto">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_200px_1fr] items-stretch min-h-[160px] gap-6"
          >
            {/* German Side */}
            <div className="bg-[#D0DDE8] p-4 flex flex-col justify-center">
              <span className="text-[12px] text-[#00253E] uppercase mb-2 font-semibold ml-1 opacity-60">
                {t('promptLabel')}
              </span>
              <Textarea
                {...register(`triggerAiPrompt.${index}.values.de`)}
                placeholder={t('germanPromptPlaceholder')}
                className="flex-1 bg-white border border-[#E2E8F0] focus-visible:ring-0 resize-none text-[20px] font-normal leading-[110%] text-[#00253E] rounded-[4px] p-4"
              />
            </div>

            {/* Middle Side */}
            <div className="flex items-center justify-center py-4 ">
              <div className="bg-[#BADA55] w-full min-h-[64px] py-4 flex items-center justify-center rounded-[4px] text-center px-4 shadow-sm border border-[#BADA55]">
                <span className="text-[18px] font-semibold text-[#00253E] leading-[110%] uppercase">
                  {field.name}
                </span>

              </div>
            </div>

            {/* English Side */}
            <div className="bg-[#ECF2CB] p-4 flex flex-col justify-center ">
              <span className="text-[12px] text-[#00253E] uppercase mb-2 font-semibold ml-1 opacity-60">
                {t('promptLabel')}
              </span>
              <Textarea
                {...register(`triggerAiPrompt.${index}.values.en`)}
                placeholder={t('englishPromptPlaceholder')}
                className="flex-1 bg-white border border-[#E2E8F0] focus-visible:ring-0 resize-none text-[20px] font-normal leading-[110%] text-[#00253E] rounded-[4px] p-4"
              />
            </div>
          </div>
        ))}
      </div>

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
