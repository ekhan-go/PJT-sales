import { lazy, Suspense } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import { NavLink, Link, Route, Routes } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import SalesListPage from './pages/SalesListPage'
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
import { salesTables } from './data/salesTables'

export default function App() {
 return <>
  <Navbar expand="md" className="app-nav" sticky="top">
   <Container>
    <Navbar.Brand as={Link} to="/"><span className="brand-icon">S</span>판매관리 시스템</Navbar.Brand>
    <Navbar.Toggle aria-controls="sales-menu" />
    <Navbar.Collapse id="sales-menu">
     <Nav className="ms-auto">
      <Nav.Link as={NavLink} to="/" end>홈</Nav.Link>
      {salesTables.map(table => <Nav.Link as={NavLink} key={table.key} to={'/' + table.key}>{table.title}</Nav.Link>)}
     </Nav>
    </Navbar.Collapse>
   </Container>
  </Navbar>
  <main id="main-content"><Container className="page-container">
   <Routes>
    <Route path="/" element={<Suspense fallback={<div className="py-5 text-center" role="status"><Spinner size="sm" className="me-2" />대시보드 불러오는 중</div>}><DashboardPage /></Suspense>} />
    {salesTables.map(table => <Route key={table.key} path={'/' + table.key} element={<SalesListPage key={table.key} table={table} />} />)}
    <Route path="*" element={<div className="not-found"><h1>페이지를 찾을 수 없습니다.</h1><Link to="/">홈으로</Link></div>} />
   </Routes>
  </Container></main>
 </>
}
