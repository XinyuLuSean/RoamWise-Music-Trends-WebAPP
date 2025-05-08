// src/pages/ChoroplethMap.js
import React, { useMemo } from 'react'
import { scaleLinear } from 'd3-scale'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import countriesLib from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

// 注册语言包
countriesLib.registerLocale(enLocale)

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export default function ChoroplethMap({ data }) {
  // 验证 data 是否拿到
  console.log('传进来的 data:', data)

  // 1) 计算最大值
  const maxCount = useMemo(
    () => Math.max(0, ...data.map(d => d.album_count)),
    [data]
  )

  // 2) 构造线性色标
  const colorScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, maxCount])             // 从 0 到 最大值
        .range(['#e0f3f8', '#08306b']),    // 浅 → 深
    [maxCount]
  )

  // 3) 两字母码 → 数字码 → album_count 的 lookup
  const lookupNum = useMemo(() => {
    const map = {}
    data.forEach(d => {
      const alpha2 = d.country.toUpperCase()                  // e.g. 'DE'
      const numStr = countriesLib.alpha2ToNumeric(alpha2)     // e.g. '276' or '004'
      const num = parseInt(numStr, 10)                        // 转成数字 276 或 4
      map[num] = d.album_count
    })
    console.log('lookupNum:', map)
    return map
  }, [data])

  return (
    <ComposableMap projectionConfig={{ scale: 130 }}>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map(geo => {
            // 🔍 验证 topojson 的 id
            console.log('geo.id:', geo.id)
            const value = lookupNum[geo.id] || 0
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={value > 0 ? colorScale(value) : '#EEE'}
                stroke="#DDD"
              />
            )
          })
        }
      </Geographies>
    </ComposableMap>
  )
}