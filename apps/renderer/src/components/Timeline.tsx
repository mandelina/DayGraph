import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {
  data: Array<{
    timestamp: string
    clicks: number
    keypress: number
  }>
}

// 가장 단순한 막대 차트로 클릭 수를 표현 (데모)
export function Timeline({ data }: Props) {
  const compact = data.slice(0, 120).map(d => ({
    t: d.timestamp.slice(11, 19),
    clicks: d.clicks,
    keypress: d.keypress,
  }))

  return (
    <div className="h-64 bg-zinc-900 rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={compact}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="t" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="clicks" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

