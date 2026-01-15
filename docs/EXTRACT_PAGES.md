# Page Extraction Plan

This document tracks the extraction of App.tsx into separate page components.

## Pages to Create:

1. ✅ LoginPage.tsx - Created
2. ⏳ AdminPage.tsx - Extract AdminDashboard (lines 564-865)
3. ⏳ TeacherPage.tsx - Extract TeacherDashboard (lines 868-1063)
4. ⏳ SalesPage.tsx - Extract SalesDashboard (lines 360-561)
5. ⏳ StudentPage.tsx - Extract StudentPortal (lines 1066-1305)
6. ✅ DashboardPage.tsx - Created (redirects based on role)
7. ✅ AppContext.tsx - Created
8. ✅ ProtectedRoute.tsx - Created
9. ✅ Navbar.tsx - Created
10. ✅ StatCard.tsx - Created
11. ✅ SecureMaterialViewer.tsx - Created

## Next Steps:

Extract each dashboard component into its own page file, then update App.tsx to use React Router.
