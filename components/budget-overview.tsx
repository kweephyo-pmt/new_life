"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react"

export function BudgetOverview() {
  const budget = {
    total: 5000,
    spent: 2340,
    remaining: 2660,
    percentSpent: 46.8,
  }

  const categories = [
    { name: "Accommodation", spent: 980, budget: 1500, color: "bg-chart-1" },
    { name: "Food & Dining", spent: 650, budget: 1200, color: "bg-chart-2" },
    { name: "Transportation", spent: 420, budget: 800, color: "bg-chart-3" },
    { name: "Activities", spent: 290, budget: 1000, color: "bg-chart-4" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Budget</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">${budget.total.toLocaleString()}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-3xl font-bold text-foreground">${budget.spent.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">{budget.percentSpent}% of budget</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-foreground">${budget.remaining.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">{(100 - budget.percentSpent).toFixed(1)}% left</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Budget by Category</h3>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const percentSpent = (category.spent / category.budget) * 100
            const isOverBudget = percentSpent > 100

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${category.spent} / ${category.budget}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isOverBudget ? "bg-destructive" : category.color} transition-all`}
                    style={{ width: `${Math.min(percentSpent, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {percentSpent.toFixed(1)}% {isOverBudget && "- Over budget!"}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
