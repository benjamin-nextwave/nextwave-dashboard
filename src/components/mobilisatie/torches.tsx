'use client'

export function Torches() {
  return (
    <>
      {/* Left torch */}
      <div className="fixed left-2 top-1/3 z-0 hidden lg:flex flex-col items-center gap-0 select-none pointer-events-none">
        <div className="text-3xl animate-torch-flicker">🔥</div>
        <div className="text-3xl mt-[-4px]">🪵</div>
      </div>
      <div className="fixed left-2 top-2/3 z-0 hidden lg:flex flex-col items-center gap-0 select-none pointer-events-none">
        <div className="text-3xl animate-torch-flicker-alt">🔥</div>
        <div className="text-3xl mt-[-4px]">🪵</div>
      </div>

      {/* Right torch */}
      <div className="fixed right-2 top-1/3 z-0 hidden lg:flex flex-col items-center gap-0 select-none pointer-events-none">
        <div className="text-3xl animate-torch-flicker-alt">🔥</div>
        <div className="text-3xl mt-[-4px]">🪵</div>
      </div>
      <div className="fixed right-2 top-2/3 z-0 hidden lg:flex flex-col items-center gap-0 select-none pointer-events-none">
        <div className="text-3xl animate-torch-flicker">🔥</div>
        <div className="text-3xl mt-[-4px]">🪵</div>
      </div>
    </>
  )
}
