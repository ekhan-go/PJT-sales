import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { PERIODS, KPI_DEFINITIONS } from '../constants/dashboardFields'
import { periodRange } from '../utils/dashboardUtils'
import KpiCard from '../components/dashboard/KpiCard'
import MonthlySalesChart from '../components/dashboard/MonthlySalesChart'
import TopCustomers from '../components/dashboard/TopCustomers'
import LowStockTable from '../components/dashboard/LowStockTable'
import DashboardIcon from '../components/dashboard/DashboardIcon'
import './DashboardPage.css'
const shortcuts = [
 { title: '거래처 관리', description: '함께하는 거래처를 확인하세요', to: '/customers', icon: 'customers' },
 { title: '상품·재고 조회', description: '상품별 재고 현황을 살펴보세요', to: '/stocks', icon: 'stocks' },
 { title: '거래내역 관리', description: '거래 흐름을 확인하세요', to: '/trades', icon: 'trades' },
 { title: '매출 분석', description: '매출 추이와 주요 거래처를 살펴보세요', href: '#sales-analysis', icon: 'analysis' },
]
export default function DashboardPage() {
 const [period, setPeriod] = useState('thisMonth')
 const [applied, setApplied] = useState({ period: 'thisMonth', revision: 0 })
 const query = useMemo(() => applied, [applied])
 const range = periodRange(applied.period)
 const label = PERIODS.find(item => item.value === applied.period).label
 function submit(event) { event.preventDefault(); setApplied(value => ({ period, revision: value.revision + 1 })) }
 return <Container fluid className="dashboard px-0">
  <header className="dashboard-heading">
   <div><p className="dashboard-eyebrow"><span />BUSINESS OVERVIEW</p><h1>판매관리 대시보드<span className="heading-dot" aria-hidden="true">.</span></h1><p className="dashboard-subtitle">흩어진 숫자를 모아, 다음 비즈니스를 준비하세요.</p></div>
   <span className="demo-badge"><span />더미 데이터 미리보기</span>
  </header>
  <section className="dashboard-querybar" aria-label="대시보드 조회 조건">
   <div className="querybar-context"><span className="calendar-symbol"><DashboardIcon name="calendar" /></span><div><span className="querybar-label">조회 기간</span><p aria-live="polite">{label}<span className="querybar-divider" />{range.start.replace('-', '.')} — {range.end.replace('-', '.')}</p></div></div>
   <Form onSubmit={submit} className="dashboard-filter"><Form.Label htmlFor="dashboard-period" visuallyHidden>조회 기간</Form.Label><Form.Select id="dashboard-period" value={period} onChange={event => setPeriod(event.target.value)}>{PERIODS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</Form.Select><Button type="submit" variant="primary">조회<DashboardIcon name="arrow" size={16} /></Button></Form>
  </section>
  <div className="dashboard-section-heading"><div><span className="section-marker">01</span><h2>핵심 지표</h2></div><p>매출·건수 증감은 선택 기간 마지막 월의 전월 대비</p></div>
  <Row className="g-3 dashboard-kpi-grid">{KPI_DEFINITIONS.map(definition => <Col xs={12} md={6} key={definition.key}><KpiCard definition={definition} query={query} /></Col>)}</Row>
  <div className="dashboard-section-heading analysis-section-heading"><div><span className="section-marker">02</span><h2>매출 인사이트</h2></div><p>흐름을 읽고, 기회를 발견하세요</p></div>
  <Row className="g-4"><Col xs={12} lg={6}><MonthlySalesChart query={query} /></Col><Col xs={12} lg={6}><TopCustomers query={query} /></Col></Row>
  <Row className="g-4 mt-0"><Col xs={12}><LowStockTable query={query} /></Col></Row>
  <section className="dashboard-shortcuts" aria-labelledby="shortcut-title">
   <div className="dashboard-section-heading"><div><span className="section-marker">03</span><h2 id="shortcut-title">빠른 업무 이동</h2></div><p>필요한 업무로 바로 연결됩니다</p></div>
   <Row className="g-3">{shortcuts.map(item => <Col xs={12} md={6} key={item.icon}><Card as={item.href ? 'a' : Link} {...(item.href ? { href: item.href } : { to: item.to })} className="shortcut-card"><Card.Body><span className="shortcut-icon"><DashboardIcon name={item.icon} /></span><span className="shortcut-content"><strong>{item.title}</strong><small>{item.description}</small></span><span className="shortcut-arrow"><DashboardIcon name="arrow" size={18} /></span></Card.Body></Card></Col>)}</Row>
  </section>
  <footer className="dashboard-footer"><span>판매관리 시스템</span><span>데이터로 연결되는 더 나은 비즈니스</span></footer>
 </Container>
}
