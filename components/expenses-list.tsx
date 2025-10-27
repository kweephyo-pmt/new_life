"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Tag, MoreVertical } from "lucide-react"

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  location: string
  notes?: string
}

export function ExpensesList() {
  const [expenses] = useState<Expense[]>([
    {
      id: "1",
      title: "Hotel Booking - 3 nights",
      amount: 450,
      category: "Accommodation",
      date: "2025-06-15",
      location: "Tokyo, Japan",
      notes: "Shibuya district hotel",
    },
    {
      id: "2",
      title: "Flight Tickets",
      amount: 890,
      category: "Transportation",
      date: "2025-06-14",
      location: "International",
    },
    {
      id: "3",
      title: "Dinner at Sushi Restaurant",
      amount: 120,
      category: "Food & Dining",
      date: "2025-06-15",
      location: "Shibuya, Tokyo",
    },
    {
      id: "4",
      title: "Tokyo DisneySea Tickets",
      amount: 180,
      category: "Activities",
      date: "2025-06-16",
      location: "Tokyo DisneySea",
    },
    {
      id: "5",
      title: "Train Pass - 7 days",
      amount: 280,
      category: "Transportation",
      date: "2025-06-15",
      location: "Tokyo, Japan",
    },
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Accommodation: "bg-chart-1/10 text-chart-1",
      "Food & Dining": "bg-chart-2/10 text-chart-2",
      Transportation: "bg-chart-3/10 text-chart-3",
      Activities: "bg-chart-4/10 text-chart-4",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Expenses</h3>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{expense.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{expense.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">฿{expense.amount}</div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}
                    >
                      <Tag className="w-3 h-3" />
                      {expense.category}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {expense.notes && <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
