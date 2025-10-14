import { Compass, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BudgetOverview } from "@/components/budget-overview"
import { ExpensesList } from "@/components/expenses-list"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { BudgetChart } from "@/components/budget-chart"

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">New Life</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">Explore</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trips">My Trips</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discover">Discover</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community">Community</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Budget Tracker</h1>
              <p className="text-muted-foreground">Manage your travel expenses and stay on budget</p>
            </div>
            <AddExpenseDialog>
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </Button>
            </AddExpenseDialog>
          </div>

          <BudgetOverview />

          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <ExpensesList />
            </div>
            <div>
              <BudgetChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
