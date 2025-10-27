"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Lightbulb, Plus } from "lucide-react"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { getExpenses, type Expense } from "@/lib/expenses-storage"
import { useAuth } from "@/contexts/AuthContext"

interface BudgetOptimizerProps {
  tripId: string
  totalBudget: number
}

export function BudgetOptimizer({ tripId, totalBudget }: BudgetOptimizerProps) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExpenses()
  }, [tripId, user])

  const loadExpenses = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getExpenses(tripId, user.uid)
      setExpenses(data)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const budget = {
    total: totalBudget,
    spent: totalSpent,
    remaining: totalBudget - totalSpent,
    percentSpent: (totalSpent / totalBudget) * 100,
  }

  // Calculate category spending
  const categoryMap: Record<string, number> = {
    accommodation: 0,
    food: 0,
    transportation: 0,
    activities: 0,
    other: 0,
  }
  
  expenses.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount
  })

  const categories = [
    { name: "Accommodation", key: "accommodation", spent: categoryMap.accommodation, budget: totalBudget * 0.3, color: "bg-blue-500" },
    { name: "Food & Dining", key: "food", spent: categoryMap.food, budget: totalBudget * 0.25, color: "bg-green-500" },
    { name: "Transportation", key: "transportation", spent: categoryMap.transportation, budget: totalBudget * 0.2, color: "bg-yellow-500" },
    { name: "Activities", key: "activities", spent: categoryMap.activities, budget: totalBudget * 0.25, color: "bg-purple-500" },
  ]

  // Generate AI optimization suggestions
  const optimizations = []
  
  if (expenses.length === 0) {
    optimizations.push({
      title: "Track your expenses",
      savings: 0,
      description: "Start adding expenses to get personalized budget optimization tips",
    })
  } else {
    // Check for overspending categories
    categories.forEach(cat => {
      if (cat.spent > cat.budget) {
        const overspend = cat.spent - cat.budget
        optimizations.push({
          title: `Reduce ${cat.name} spending`,
          savings: Math.round(overspend * 0.2),
          description: `You're ฿${Math.round(overspend)} over budget. Consider more budget-friendly options.`,
        })
      }
    })

    // If under budget, suggest savings
    if (budget.remaining > 0 && budget.percentSpent < 80) {
      optimizations.push({
        title: "You're on track!",
        savings: Math.round(budget.remaining * 0.1),
        description: `Great job! You have ฿${Math.round(budget.remaining)} remaining. Keep monitoring your spending.`,
      })
    }

    // If no specific issues, give general tip
    if (optimizations.length === 0) {
      optimizations.push({
        title: "Balanced spending",
        savings: 0,
        description: "Your budget is well-distributed across categories. Keep it up!",
      })
    }
  }

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
          <AddExpenseDialog tripId={tripId} onExpenseAdded={loadExpenses}>
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
