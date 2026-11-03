import api from './axiosInstance'
const resource = table => '/sales/' + encodeURIComponent(table)
const rowResource = (table,id) => resource(table) + '/' + encodeURIComponent(id)
export async function getSalesRows(table, query, signal) {
 return (await api.get(resource(table), { params: query, signal })).data
}
export async function getSalesRow(table, id, signal) {
 return (await api.get(rowResource(table,id), { signal })).data
}
export async function createSalesRow(table, values) {
 return (await api.post(resource(table), { values })).data
}
export async function updateSalesRow(table, id, values, version) {
 return (await api.put(rowResource(table,id), { values, version })).data
}
export async function deleteSalesRow(table, id, version) {
 await api.delete(rowResource(table,id), { data: { version } })
}
