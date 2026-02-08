'use client'

import type { MeetingWithCompany } from '@/types/database'

interface TodayMeetingsProps {
  meetings: MeetingWithCompany[]
  loading: boolean
}

export function TodayMeetings({ meetings, loading }: TodayMeetingsProps) {
  if (loading) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Vergaderingen vandaag</h2>
      {meetings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Geen vergaderingen vandaag
        </p>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`rounded-lg border p-3 ${
                meeting.is_completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p
                    className={`font-medium ${
                      meeting.is_completed ? 'line-through' : ''
                    }`}
                  >
                    {meeting.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.company_name} &middot;{' '}
                    {meeting.meeting_time.slice(0, 5)}
                  </p>
                </div>
                {meeting.meeting_link && (
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline shrink-0 ml-3"
                  >
                    Link openen
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
