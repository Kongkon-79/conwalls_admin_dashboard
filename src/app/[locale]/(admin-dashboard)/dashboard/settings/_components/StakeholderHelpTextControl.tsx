'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SystemSettings, HelpText } from '@/types/settings'
import { useTranslations } from 'next-intl'

interface StakeholderHelpTextControlProps {
  settings: SystemSettings | null
  onUpdate: () => void
}

const STAKEHOLDER_HELP_TEXT_CATEGORIES = [
  'Pain point',
  'Benefits',
  'Trigger Evaluations',
  'Objections / Concerns',
  'Objection Handling',
  'Call to Action',
]

const StakeholderHelpTextControl = ({
  settings,
  onUpdate,
}: StakeholderHelpTextControlProps) => {
  const t = useTranslations('common')
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, handleSubmit, reset } = useForm<{
    stakeholderHelpTexts: HelpText[]
  }>({
    defaultValues: {
      stakeholderHelpTexts: STAKEHOLDER_HELP_TEXT_CATEGORIES.map((category) => ({
        name: category,
        values: { de: '', en: '' },
      })),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'stakeholderHelpTexts',
  })

  useEffect(() => {
    if (
      settings &&
      settings.stakeholderHelpTexts &&
      settings.stakeholderHelpTexts.length > 0
    ) {
      const mapped = STAKEHOLDER_HELP_TEXT_CATEGORIES.map((category) => {
        const existing = settings.stakeholderHelpTexts.find(
          (item) => item.name === category,
        )

        return existing || { name: category, values: { de: '', en: '' } }
      })

      reset({ stakeholderHelpTexts: mapped })
    }
  }, [settings, reset])

  const onSubmit = async (values: { stakeholderHelpTexts: HelpText[] }) => {
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
            stakeholderHelpTexts: values.stakeholderHelpTexts,
          }),
        },
      )

      if (!res.ok) {
        throw new Error('Failed to update stakeholder help texts')
      }

      toast.success('Stakeholder help texts updated successfully!')
      onUpdate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      <div className="bg-[#00253E] text-white overflow-hidden rounded-t-[8px]">
        <div className="grid grid-cols-[1fr_200px_1fr] border-b border-gray-700">
          <div className="py-3 px-4 text-center font-bold text-sm uppercase">
            {t('german')}
          </div>
          <div className="py-3 px-4 text-center font-bold text-sm uppercase">
            {t('stakeholderHelpTextsHeader')}
          </div>
          <div className="py-3 px-4 text-center font-bold text-sm uppercase">
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
            <div className="bg-[#D0DDE8] p-4 flex flex-col justify-center">
              <Textarea
                {...register(`stakeholderHelpTexts.${index}.values.de`)}
                placeholder={t('germanTextPlaceholder')}
                className="flex-1 bg-white border border-[#E2E8F0] focus-visible:ring-0 resize-none text-[20px] font-normal leading-[110%] text-[#00253E] rounded-[4px] p-4"
              />
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="bg-[#BADA55] w-full min-h-[64px] py-4 flex items-center justify-center rounded-[4px] text-center px-4 shadow-sm border border-[#BADA55]">
                <span className="text-[18px] font-semibold text-[#00253E] leading-[110%] line-clamp-2">
                  {field.name}
                </span>
              </div>
            </div>

            <div className="bg-[#ECF2CB] p-4 flex flex-col justify-center">
              <Textarea
                {...register(`stakeholderHelpTexts.${index}.values.en`)}
                placeholder={t('englishTextPlaceholder')}
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

export default StakeholderHelpTextControl
