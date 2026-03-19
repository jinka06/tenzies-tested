import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import Die from "../Die"

describe("Die component", () => {
  it("renders its numeric value", () => {
    render(<Die value={4} isHeld={false} hold={() => {}} />)
    expect(screen.getByRole("button")).toHaveTextContent("4")
  })

  it("has a white background when not held", () => {
    render(<Die value={3} isHeld={false} hold={() => {}} />)
    const btn = screen.getByRole("button")
    expect(btn.style.backgroundColor).toBe("white")
  })

  it("has a green background when held", () => {
    render(<Die value={3} isHeld={true} hold={() => {}} />)
    const btn = screen.getByRole("button")
    expect(btn.style.backgroundColor).toBe("rgb(89, 227, 145)")
  })

  it("calls hold() when clicked", async () => {
    const user = userEvent.setup()
    const mockHold = vi.fn()
    render(<Die value={2} isHeld={false} hold={mockHold} />)
    await user.click(screen.getByRole("button"))
    expect(mockHold).toHaveBeenCalledOnce()
  })

  it("sets aria-pressed to true when held", () => {
    render(<Die value={5} isHeld={true} hold={() => {}} />)
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })

  it("sets aria-pressed to false when not held", () => {
    render(<Die value={5} isHeld={false} hold={() => {}} />)
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")
  })

  it("has an accessible aria-label describing its value and held state", () => {
    render(<Die value={6} isHeld={false} hold={() => {}} />)
    expect(screen.getByRole("button")).toHaveAccessibleName(/die with value 6/i)
  })
})