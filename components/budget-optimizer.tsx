"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Lightbulb, Plus } from "lucide-react"
import { AddExpenseDialog } from "@/components/add-expense-dialog"

interface BudgetOptimizerProps {
  tripId: string
  totalBudget: number
}

export function BudgetOptimizer({ tripId, totalBudget }: BudgetOptimizerProps) {
  // TODO: Load expenses from Firestore based on tripId
  // For now showing initial budget with no expenses
  const budget = {
    total: totalBudget,
    spent: 0,
    remaining: totalBudget,
    percentSpent: 0,
  }

  const categories = [
    { name: "Accommodation", spent: 0, budget: totalBudget * 0.3, color: "bg-chart-1" },
    { name: "Food & Dining", spent: 0, budget: totalBudget * 0.25, color: "bg-chart-2" },
    { name: "Transportation", spent: 0, budget: totalBudget * 0.2, color: "bg-chart-3" },
    { name: "Activities", spent: 0, budget: totalBudget * 0.25, color: "bg-chart-4" },
  ]

  const optimizations = [
    {
      title: "Track your expenses",
      savings: 0,
      description: "Start adding expenses to get personalized budget optimization tips",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Budget</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">฿{budget.total.toLocaleString()}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Spent</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-foreground">฿{budget.spent.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">{budget.percentSpent.toFixed(1)}% used</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-foreground">฿{budget.remaining.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">{(100 - budget.percentSpent).toFixed(1)}% left</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Budget Breakdown</h3>
          <AddExpenseDialog>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </AddExpenseDialog>
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
                    ฿{category.spent} / ฿{category.budget}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isOverBudget ? "bg-destructive" : category.color} transition-all`}
                    style={{ width: `${Math.min(percentSpent, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* AI Optimization Suggestions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Smart Savings</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">AI-powered suggestions to optimize your budget</p>

        <div className="space-y-3">
          {optimizations.map((opt, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-accent/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-foreground">{opt.title}</h4>
                <span className="text-sm font-bold text-secondary">Save ฿{opt.savings}</span>
              </div>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total Potential Savings</span>
            <span className="text-xl font-bold text-secondary">
              ฿{optimizations.reduce((sum, opt) => sum + opt.savings, 0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
