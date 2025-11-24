'use client'

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#519CAB', '#FFC64F', '#C3E7F1', '#20373B', '#FDF8F3', '#F8E8E8'];

const StatCard = ({ title, value, subtitle, icon, trend, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-5 shadow-soft transition-transform hover:scale-[1.02]`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gunmetal/60 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gunmetal">{value}</p>
        {subtitle && <p className="text-sm text-gunmetal/50 mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const ChartCard = ({ title, children, actions }) => (
  <div className="bg-white rounded-2xl p-6 shadow-card">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gunmetal">{title}</h3>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    {children}
  </div>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week
  const [data, setData] = useState({
    wedding: null,
    expenses: [],
    guests: [],
    tasks: [],
    bookings: [],
    categories: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [weddingRes, expensesRes, guestsRes, tasksRes, bookingsRes, categoriesRes] = await Promise.all([
        fetch('/api/weddings'),
        fetch('/api/expenses'),
        fetch('/api/guests'),
        fetch('/api/tasks'),
        fetch('/api/bookings'),
        fetch('/api/categories')
      ]);

      const [weddingData, expensesData, guestsData, tasksData, bookingsData, categoriesData] = await Promise.all([
        weddingRes.json(),
        expensesRes.json(),
        guestsRes.json(),
        tasksRes.json(),
        bookingsRes.json(),
        categoriesRes.json()
      ]);

      setData({
        wedding: Array.isArray(weddingData) && weddingData.length > 0 ? weddingData[0] : null,
        expenses: Array.isArray(expensesData) ? expensesData : [],
        guests: Array.isArray(guestsData) ? guestsData : [],
        tasks: Array.isArray(tasksData) ? tasksData : [],
        bookings: Array.isArray(bookingsData) ? bookingsData : [],
        categories: Array.isArray(categoriesData) ? categoriesData : []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-moonstone" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gunmetal">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!data.wedding) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Reports & Analytics</h1>
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <div className="text-6xl mb-4">💒</div>
          <h2 className="text-xl font-semibold text-gunmetal mb-2">No Wedding Created Yet</h2>
          <p className="text-gunmetal/60 mb-6">Create a wedding to view reports and analytics</p>
          <a href="/dashboard/wedding" className="inline-block bg-moonstone text-white px-6 py-3 rounded-xl font-medium hover:bg-moonstone-dark transition-colors">
            Create Wedding
          </a>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalBudget = data.wedding.budget || 0;
  const totalSpent = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Guest stats
  const totalGuests = data.guests.length;
  const acceptedGuests = data.guests.filter(g => g.rsvp?.status === 'ACCEPTED').length;
  const pendingGuests = data.guests.filter(g => !g.rsvp || g.rsvp.status === 'PENDING').length;
  const rejectedGuests = data.guests.filter(g => g.rsvp?.status === 'REJECTED').length;
  const rsvpRate = totalGuests > 0 ? Math.round(((acceptedGuests + rejectedGuests) / totalGuests) * 100) : 0;

  // Task stats
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasks = data.tasks.filter(t => t.status === 'PENDING').length;
  const inProgressTasks = data.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Vendor stats
  const totalBookings = data.bookings.length;
  const totalVendorCost = data.bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalVendorPaid = data.bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const vendorPaymentRate = totalVendorCost > 0 ? Math.round((totalVendorPaid / totalVendorCost) * 100) : 0;

  // Budget by category
  const budgetByCategory = data.categories.map(cat => {
    const categoryExpenses = data.expenses.filter(exp => exp.categoryId === cat.id);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: cat.name,
      value: total,
      count: categoryExpenses.length
    };
  }).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value);

  // Guest RSVP distribution
  const guestRSVPData = [
    { name: 'Accepted', value: acceptedGuests, color: '#22c55e' },
    { name: 'Pending', value: pendingGuests, color: '#FFC64F' },
    { name: 'Rejected', value: rejectedGuests, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Task status distribution
  const taskStatusData = [
    { name: 'Completed', value: completedTasks, color: '#22c55e' },
    { name: 'In Progress', value: inProgressTasks, color: '#519CAB' },
    { name: 'Pending', value: pendingTasks, color: '#FFC64F' }
  ].filter(d => d.value > 0);

  // Monthly expenses (last 6 months)
  const monthlyExpenses = data.expenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, amount: 0, count: 0 };
    }
    acc[monthKey].amount += exp.amount;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  const expenseTrendData = Object.values(monthlyExpenses)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  // Vendor payment status
  const vendorPaymentData = data.bookings.map(booking => ({
    name: booking.vendor.name,
    total: booking.amount,
    paid: booking.paidAmount,
    remaining: booking.amount - booking.paidAmount
  }));

  // Top 5 expenses
  const topExpenses = [...data.expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gunmetal">Reports & Analytics</h1>
          <p className="text-gunmetal/60 mt-1">Comprehensive insights for {data.wedding.title}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              timeRange === 'all' ? 'bg-moonstone text-white' : 'bg-gray-100 text-gunmetal hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button className="bg-moonstone text-white px-4 py-2 rounded-xl font-medium hover:bg-moonstone-dark transition-colors">
            📥 Export PDF
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Budget Used"
          value={`${budgetPercentage}%`}
          subtitle={`₹${totalSpent.toLocaleString()} / ₹${totalBudget.toLocaleString()}`}
          icon="💰"
          bgColor="bg-card-yellow"
        />
        <StatCard
          title="RSVP Response"
          value={`${rsvpRate}%`}
          subtitle={`${acceptedGuests + rejectedGuests} / ${totalGuests} responded`}
          icon="👥"
          bgColor="bg-card-blue"
        />
        <StatCard
          title="Tasks Complete"
          value={`${taskCompletionRate}%`}
          subtitle={`${completedTasks} / ${totalTasks} done`}
          icon="✅"
          bgColor="bg-card-green"
        />
        <StatCard
          title="Vendor Payments"
          value={`${vendorPaymentRate}%`}
          subtitle={`₹${totalVendorPaid.toLocaleString()} paid`}
          icon="🤝"
          bgColor="bg-card-pink"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget Breakdown */}
        <ChartCard title="Budget by Category">
          {budgetByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#20373B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#20373B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#519CAB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No expense data yet
            </div>
          )}
        </ChartCard>

        {/* Guest RSVP Distribution */}
        <ChartCard title="Guest RSVP Status">
          {guestRSVPData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={guestRSVPData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {guestRSVPData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} guests`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No guest data yet
            </div>
          )}
        </ChartCard>

        {/* Expense Trend */}
        <ChartCard title="Expense Trend">
          {expenseTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenseTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#20373B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#20373B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#519CAB" strokeWidth={2} name="Amount" />
                <Line type="monotone" dataKey="count" stroke="#FFC64F" strokeWidth={2} name="Count" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No trend data yet
            </div>
          )}
        </ChartCard>

        {/* Task Status */}
        <ChartCard title="Task Progress">
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} tasks`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No task data yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <ChartCard title="Top 5 Expenses">
          {topExpenses.length > 0 ? (
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-moonstone text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gunmetal">{expense.category.name}</p>
                      <p className="text-sm text-gunmetal/60">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gunmetal">₹{expense.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No expenses recorded yet
            </div>
          )}
        </ChartCard>

        {/* Vendor Payment Status */}
        <ChartCard title="Vendor Payment Status">
          {vendorPaymentData.length > 0 ? (
            <div className="space-y-3">
              {vendorPaymentData.slice(0, 5).map((vendor, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gunmetal">{vendor.name}</p>
                    <p className="text-sm text-gunmetal/60">
                      ₹{vendor.paid.toLocaleString()} / ₹{vendor.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-moonstone to-saffron rounded-full"
                      style={{ width: `${(vendor.paid / vendor.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gunmetal/50 mt-1">
                    {vendor.remaining > 0 ? `₹${vendor.remaining.toLocaleString()} remaining` : 'Fully paid'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gunmetal/50">
              No vendor bookings yet
            </div>
          )}
        </ChartCard>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-gunmetal mb-4">Budget Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Total Budget:</span>
              <span className="font-semibold text-gunmetal">₹{totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Total Spent:</span>
              <span className="font-semibold text-saffron-dark">₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Remaining:</span>
              <span className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(remaining).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gunmetal/60">Categories:</span>
              <span className="font-semibold text-gunmetal">{budgetByCategory.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-gunmetal mb-4">Guest Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Total Invited:</span>
              <span className="font-semibold text-gunmetal">{totalGuests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Accepted:</span>
              <span className="font-semibold text-green-600">{acceptedGuests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Pending:</span>
              <span className="font-semibold text-saffron-dark">{pendingGuests}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gunmetal/60">Response Rate:</span>
              <span className="font-semibold text-gunmetal">{rsvpRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-gunmetal mb-4">Vendor Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Total Bookings:</span>
              <span className="font-semibold text-gunmetal">{totalBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Total Cost:</span>
              <span className="font-semibold text-gunmetal">₹{totalVendorCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gunmetal/60">Amount Paid:</span>
              <span className="font-semibold text-green-600">₹{totalVendorPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gunmetal/60">Payment Rate:</span>
              <span className="font-semibold text-gunmetal">{vendorPaymentRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}