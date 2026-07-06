import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { [key: string]: { label: string, color?: string, icon?: React.ComponentType } }
export type ChartConfig = Record<
  string,
  {
    label: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        style={
          {
            "--chart-id": chartId,
          } as React.CSSProperties
        }
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-background [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_path]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/20 [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector]:stroke-background [&_.recharts-sector.recharts-tooltip-cursor]:fill-muted/20 [&_.recharts-slice-activedot]:stroke-background [&_.recharts-tooltip-cursor]:stroke-border",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.color
  )

  if (colorConfig.length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
  ${colorConfig
    .map(([key, config]) => `--color-${key}: ${config.color};`)
    .join("\n")}
}
`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: any
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(
  (
    {
      className,
      active,
      payload,
      label,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      nameKey,
      labelKey,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || "value"}`
      const itemConfig = getChartConfig(config, item, key)
      const value =
        itemConfig && typeof itemConfig.label === "string"
          ? itemConfig.label
          : label

      return <div className="font-medium">{value}</div>
    }, [label, labelKey, hideLabel, payload, config])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {tooltipLabel}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getChartConfig(config, item, key)
            const indicatorColor =
              item.payload?.fill || item.color || "currentColor"

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dashed" && "items-start"
                )}
              >
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-[1.5px]",
                      indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                      indicator === "line" && "w-1 h-2.5",
                      indicator === "dashed" &&
                        "bg-transparent border-dashed border-t-[1.5px] w-full"
                    )}
                    style={
                      {
                        backgroundColor:
                          indicator !== "dashed" ? indicatorColor : undefined,
                        borderColor: indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <span className="text-muted-foreground">
                    {itemConfig?.label || key}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    verticalAlign?: "top" | "bottom"
    nameKey?: string
  }
>(({ className, payload, verticalAlign = "bottom", nameKey, ...props }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getChartConfig(config, item, key)

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 text-xs [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span>{itemConfig?.label || item.value}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

// Helper function to resolve config
function getChartConfig(config: ChartConfig, item: any, key: string) {
  if (key in config) {
    return config[key]
  }

  const payloadKey = item.payload?.[key]
  if (payloadKey && payloadKey in config) {
    return config[payloadKey]
  }

  return undefined
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
