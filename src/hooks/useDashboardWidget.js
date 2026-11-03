import { useCallback, useEffect, useState } from 'react'
export default function useDashboardWidget(loader, query, metric) {
 const [state, setState] = useState({ loading: true, error: '', data: null })
 const [revision, setRevision] = useState(0)
 const retry = useCallback(() => setRevision(value => value + 1), [])
 useEffect(() => {
  const controller = new AbortController()
  setState({ loading: true, error: '', data: null })
  Promise.resolve().then(() => loader(query, { signal: controller.signal, metric }))
   .then(data => { if (!controller.signal.aborted) setState({ loading: false, error: '', data }) })
   .catch(error => {
    if (!controller.signal.aborted) setState({ loading: false, data: null,
     error: error.response?.data?.message || error.message || '데이터를 불러오지 못했습니다.' })
   })
  return () => controller.abort()
 }, [loader, query, metric, revision])
 return { ...state, retry }
}
