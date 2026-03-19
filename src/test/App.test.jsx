import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import App from "../App"

// Mock react-confetti to avoid canvas errors in jsdom
vi.mock("react-confetti", () => ({ default: () => <div data-testid="confetti" /> }))

describe("App - initial render", () => {
  it("renders the title", () => {
    render(<App />)
    expect(screen.getByText("Tenzies")).toBeInTheDocument()
  })

  it("renders 10 dice", () => {
    render(<App />)
    
    const dice = screen.getAllByRole("button", { pressed: false })
      .filter(btn => btn.hasAttribute("aria-pressed"))
    expect(dice).toHaveLength(10)
  })

  it("renders a Roll button", () => {
    render(<App />)
    expect(screen.getByRole("button", { name: /roll/i })).toBeInTheDocument()
  })

  it("does not show confetti at start", () => {
    render(<App />)
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument()
  })
})

describe("App - hold/unhold a die", () => {
  it("toggles a die to held (green) on click", async () => {
    const user = userEvent.setup()
    render(<App />)
    const dice = screen.getAllByRole("button").filter(b => b.hasAttribute("aria-pressed"))
    const first = dice[0]
    expect(first.style.backgroundColor).toBe("white")
    await user.click(first)
    expect(first.style.backgroundColor).toBe("rgb(89, 227, 145)")
    expect(first).toHaveAttribute("aria-pressed", "true")
  })

  it("untogles a held die back to not-held on second click", async () => {
    const user = userEvent.setup()
    render(<App />)
    const dice = screen.getAllByRole("button").filter(b => b.hasAttribute("aria-pressed"))
    await user.click(dice[0])
    await user.click(dice[0])
    expect(dice[0].style.backgroundColor).toBe("white")
    expect(dice[0]).toHaveAttribute("aria-pressed", "false")
  })
})

describe("App - rolling dice", () => {
  it("held dice keep the same value after rolling", async () => {
    const user = userEvent.setup()
    render(<App />)
    const dice = screen.getAllByRole("button").filter(b => b.hasAttribute("aria-pressed"))
    const first = dice[0]
    const valueBefore = first.textContent
    await user.click(first) // hold it
    await user.click(screen.getByRole("button", { name: /roll/i }))
    expect(first.textContent).toBe(valueBefore)
  })

  it("the Roll button is visible and clickable", async () => {
    const user = userEvent.setup()
    render(<App />)
    const rollBtn = screen.getByRole("button", { name: /roll/i })
    await user.click(rollBtn)
    expect(rollBtn).toBeInTheDocument()
  })
})

describe("App - win condition", () => {
  it("shows confetti and 'New Game' button when all dice match and are held", async () => {
    // To force win state without depending on random values, we mock useState
    // by leveraging the fact that if we can control dice we can check the win path.
    // Lightweight approach: spy on Math.random to control dice values.
    vi.spyOn(Math, "random").mockReturnValue(0.1) // always ceil to 1
    const user = userEvent.setup()
    render(<App />)
    const dice = screen.getAllByRole("button").filter(b => b.hasAttribute("aria-pressed"))

    for (const die of dice) {
      await user.click(die)
    }
    expect(screen.getByRole("button", { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByTestId("confetti")).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it("starts a new game when 'New Game' is clicked", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1)
    const user = userEvent.setup()
    render(<App />)
    const dice = screen.getAllByRole("button").filter(b => b.hasAttribute("aria-pressed"))
    for (const die of dice) await user.click(die)
    const newGameBtn = screen.getByRole("button", { name: /new game/i })
    await user.click(newGameBtn)
    expect(screen.getByRole("button", { name: /roll/i })).toBeInTheDocument()
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})