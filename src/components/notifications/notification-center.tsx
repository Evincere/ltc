"use client";

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { notificationService } from '@/services/notifications'

interface Notification {
  id: string
  type: 'price' | 'technical' | 'sentiment'
  title: string
  message: string
  timestamp: number
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    notificationService.markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
    notifications.forEach(notification => {
      if (!notification.read) {
        notificationService.markAsRead(notification.id)
      }
    })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icons.bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Notificaciones</h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todo como leído
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay notificaciones
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      !notification.read ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Icons.check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}