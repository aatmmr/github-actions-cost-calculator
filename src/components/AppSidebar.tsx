import { ChevronDown, Info } from 'lucide-react'
import { Calculator, Coins, ListChecks, SquaresFour, ArrowsLeftRight, ChartBar, GithubLogo } from '@phosphor-icons/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

export type CalculatorTab = 'select' | 'visual' | 'examples' | 'comparison'
export type AppView =
  | { section: 'calculator'; tab: CalculatorTab }
  | { section: 'usage' }

interface AppSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

const calculatorItems = [
  { title: 'Select Runners', tab: 'select' as const, icon: ListChecks },
  { title: 'Visual Comparison', tab: 'visual' as const, icon: SquaresFour },
  { title: 'Example Costs', tab: 'examples' as const, icon: Coins },
  { title: 'Cost Comparison', tab: 'comparison' as const, icon: ArrowsLeftRight },
]

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const { setOpenMobile, isMobile } = useSidebar()

  const handleNavigate = (view: AppView) => {
    onNavigate(view)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isCalculatorActive = currentView.section === 'calculator'
  const isUsageActive = currentView.section === 'usage'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="cursor-default">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Calculator size={18} weight="duotone" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GH Actions Cost</span>
                  <span className="truncate text-xs text-muted-foreground">Calculator</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Cost Calculator with sub-items */}
              <Collapsible defaultOpen asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Cost Calculator"
                      isActive={isCalculatorActive}
                    >
                      <Coins size={18} weight="duotone" />
                      <span>Cost Calculator</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {calculatorItems.map((item) => (
                        <SidebarMenuSubItem key={item.tab}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              currentView.section === 'calculator' &&
                              currentView.tab === item.tab
                            }
                          >
                            <button
                              onClick={() =>
                                handleNavigate({ section: 'calculator', tab: item.tab })
                              }
                              className="w-full"
                            >
                              <item.icon size={16} weight="duotone" />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Usage Analysis - top level */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Usage Analysis"
                  isActive={isUsageActive}
                  onClick={() => handleNavigate({ section: 'usage' })}
                >
                  <ChartBar size={18} weight="duotone" />
                  <span>Usage Analysis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* About section - collapsible */}
        <Collapsible className="group/about">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Info className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">About</span>
              <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/about:rotate-180 group-data-[collapsible=icon]:hidden" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-2 text-xs text-muted-foreground space-y-2">
              <p>
                Compare GitHub-hosted vs self-hosted runner costs for GitHub Actions.
              </p>
              <p>
                Pricing based on{' '}
                <a
                  href="https://docs.github.com/en/billing/reference/actions-runner-pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  official 2026 rates
                </a>
                .
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Contribute on GitHub">
              <a
                href="https://github.com/aatmmr/github-actions-cost-calculator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogo size={18} weight="duotone" />
                <span>Contribute</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <Separator className="my-2" />

        {/* Contributor section */}
        <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Built with ❤️ and ✨ by </span>
            <a
              href="https://github.com/aatmmr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://github.com/aatmmr.png?size=80"
                alt="GitHub avatar for aatmmr"
                className="h-6 w-6 rounded-full border border-border"
                loading="lazy"
              />
            </a>
          </div>
        </div>

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
