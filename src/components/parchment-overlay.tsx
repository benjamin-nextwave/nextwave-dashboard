'use client'

export function ParchmentOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">

      {/* ── Ambient torch glow on edges ── */}
      <div
        className="absolute top-0 left-0 w-48 h-full animate-torch-glow-left"
        style={{
          background: 'linear-gradient(90deg, rgba(200,140,40,0.06) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-48 h-full animate-torch-glow-right"
        style={{
          background: 'linear-gradient(-90deg, rgba(200,140,40,0.06) 0%, transparent 100%)',
        }}
      />

      {/* ── Heraldic corner ornaments ── */}
      {/* Top-left fleur-de-lis */}
      <div className="absolute top-16 left-4 text-3xl opacity-[0.08] select-none hidden lg:block" style={{ transform: 'rotate(-15deg)' }}>⚜️</div>
      {/* Top-right shield */}
      <div className="absolute top-16 right-4 text-3xl opacity-[0.08] select-none hidden lg:block" style={{ transform: 'rotate(15deg)' }}>🛡️</div>
      {/* Bottom-left crossed swords */}
      <div className="absolute bottom-8 left-4 text-3xl opacity-[0.08] select-none hidden lg:block" style={{ transform: 'rotate(10deg)' }}>⚔️</div>
      {/* Bottom-right crown */}
      <div className="absolute bottom-8 right-4 text-3xl opacity-[0.08] select-none hidden lg:block" style={{ transform: 'rotate(-10deg)' }}>👑</div>

      {/* ── Corner border flourishes ── */}
      {/* Top-left corner */}
      <svg className="absolute top-14 left-0 w-32 h-32 opacity-[0.12] hidden md:block" viewBox="0 0 100 100">
        <path d="M0,20 Q0,0 20,0" fill="none" stroke="rgba(139,109,56,1)" strokeWidth="2" />
        <path d="M0,35 Q0,5 35,0" fill="none" stroke="rgba(139,109,56,1)" strokeWidth="1" />
        <circle cx="22" cy="22" r="3" fill="rgba(139,109,56,0.5)" />
      </svg>
      {/* Top-right corner */}
      <svg className="absolute top-14 right-0 w-32 h-32 opacity-[0.12] hidden md:block" viewBox="0 0 100 100">
        <path d="M100,20 Q100,0 80,0" fill="none" stroke="rgba(139,109,56,1)" strokeWidth="2" />
        <path d="M100,35 Q100,5 65,0" fill="none" stroke="rgba(139,109,56,1)" strokeWidth="1" />
        <circle cx="78" cy="22" r="3" fill="rgba(139,109,56,0.5)" />
      </svg>

      {/* ── Large wax seal watermark ── */}
      <div
        className="absolute hidden lg:flex items-center justify-center select-none"
        style={{
          bottom: '12%',
          right: '6%',
          width: '120px',
          height: '120px',
          opacity: 0.04,
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, #8b2020 0%, #6b1515 60%, transparent 70%)',
          }}
        >
          <span className="text-6xl">⚜️</span>
        </div>
      </div>

      {/* ── Fold creases ── */}
      {/* Diagonal fold crease - top left to center */}
      <div
        className="absolute"
        style={{
          top: '8%',
          left: '5%',
          width: '35%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139,109,56,0.12) 20%, rgba(139,109,56,0.18) 50%, rgba(139,109,56,0.12) 80%, transparent)',
          transform: 'rotate(25deg)',
          boxShadow: '0 1px 0 rgba(255,245,220,0.3)',
        }}
      />

      {/* Horizontal fold crease */}
      <div
        className="absolute"
        style={{
          top: '45%',
          left: '0',
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(139,109,56,0.1) 15%, rgba(139,109,56,0.15) 50%, rgba(139,109,56,0.1) 85%, transparent 95%)',
          boxShadow: '0 1px 0 rgba(255,245,220,0.25)',
        }}
      />

      {/* Vertical fold crease */}
      <div
        className="absolute"
        style={{
          top: '0',
          left: '50%',
          width: '1px',
          height: '100%',
          background: 'linear-gradient(180deg, transparent 5%, rgba(139,109,56,0.08) 20%, rgba(139,109,56,0.12) 50%, rgba(139,109,56,0.08) 80%, transparent 95%)',
          boxShadow: '1px 0 0 rgba(255,245,220,0.2)',
        }}
      />

      {/* Second diagonal fold - bottom right area */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          right: '3%',
          width: '28%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139,109,56,0.1) 30%, rgba(139,109,56,0.15) 60%, rgba(139,109,56,0.08), transparent)',
          transform: 'rotate(-15deg)',
          boxShadow: '0 1px 0 rgba(255,245,220,0.2)',
        }}
      />

      {/* ── Torn edges ── */}
      {/* Right side */}
      <svg className="absolute top-0 right-0 h-full w-3 opacity-30" viewBox="0 0 12 800" preserveAspectRatio="none">
        <path
          d="M12,0 L8,0 Q6,20 9,40 Q4,60 8,80 Q6,100 10,120 Q5,140 8,160 Q7,180 10,200 Q4,220 9,240 Q6,260 8,280 Q5,300 10,320 Q7,340 8,360 Q4,380 9,400 Q6,420 8,440 Q5,460 10,480 Q7,500 8,520 Q4,540 9,560 Q6,580 8,600 Q5,620 10,640 Q7,660 8,680 Q4,700 9,720 Q6,740 8,760 Q5,780 10,800 L12,800 Z"
          fill="rgba(139,109,56,0.08)"
        />
      </svg>

      {/* Left side */}
      <svg className="absolute top-0 left-0 h-full w-3 opacity-30" viewBox="0 0 12 800" preserveAspectRatio="none">
        <path
          d="M0,0 L4,0 Q6,25 3,50 Q8,75 4,100 Q6,125 2,150 Q7,175 4,200 Q6,225 3,250 Q8,275 4,300 Q6,325 2,350 Q7,375 4,400 Q6,425 3,450 Q8,475 4,500 Q6,525 2,550 Q7,575 4,600 Q6,625 3,650 Q8,675 4,700 Q6,725 2,750 Q7,775 4,800 L0,800 Z"
          fill="rgba(139,109,56,0.08)"
        />
      </svg>

      {/* ── Stains and damage ── */}
      {/* Corner damage - top right */}
      <div
        className="absolute top-0 right-0 w-24 h-24"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(139,109,56,0.08) 0%, transparent 70%)' }}
      />

      {/* Corner damage - bottom left */}
      <div
        className="absolute bottom-0 left-0 w-32 h-32"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(139,109,56,0.1) 0%, transparent 70%)' }}
      />

      {/* Water/age stain */}
      <div
        className="absolute"
        style={{
          top: '25%',
          right: '10%',
          width: '180px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(160,120,40,0.04) 0%, rgba(160,120,40,0.02) 40%, transparent 70%)',
          transform: 'rotate(20deg)',
        }}
      />

      {/* ── Blood splatters ── */}
      {/* Splatter cluster 1 - right side */}
      <div
        className="absolute"
        style={{
          top: '62%',
          right: '12%',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: 'rgba(130,20,15,0.25)',
          boxShadow: '18px -8px 0 5px rgba(130,20,15,0.18), -12px 14px 0 3px rgba(130,20,15,0.15), 28px 10px 0 2px rgba(130,20,15,0.12), -5px -10px 0 1px rgba(130,20,15,0.1), 8px 20px 0 4px rgba(130,20,15,0.1)',
        }}
      />

      {/* Splatter cluster 2 - left area */}
      <div
        className="absolute hidden md:block"
        style={{
          top: '35%',
          left: '7%',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(140,25,15,0.2)',
          boxShadow: '15px 5px 0 4px rgba(140,25,15,0.15), -6px 12px 0 2px rgba(140,25,15,0.12), 22px -3px 0 1px rgba(140,25,15,0.1)',
        }}
      />

      {/* Splatter cluster 3 - bottom center */}
      <div
        className="absolute hidden md:block"
        style={{
          bottom: '18%',
          left: '40%',
          width: '8px',
          height: '12px',
          borderRadius: '40%',
          background: 'rgba(135,22,15,0.2)',
          boxShadow: '10px -6px 0 3px rgba(135,22,15,0.14), -14px 4px 0 2px rgba(135,22,15,0.12), 5px 15px 0 1px rgba(135,22,15,0.1)',
        }}
      />

      {/* Smear/drag mark */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: '78%',
          right: '30%',
          width: '60px',
          height: '4px',
          borderRadius: '2px',
          background: 'linear-gradient(90deg, rgba(130,20,15,0.18), rgba(130,20,15,0.08), transparent)',
          transform: 'rotate(-8deg)',
        }}
      />

      {/* Small burn mark */}
      <div
        className="absolute"
        style={{
          bottom: '30%',
          left: '8%',
          width: '40px',
          height: '35px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(60,30,5,0.08) 0%, rgba(80,40,10,0.04) 50%, transparent 70%)',
        }}
      />

      {/* ── Decorative war map compass rose ── */}
      <div
        className="absolute hidden lg:block select-none"
        style={{
          top: '70%',
          left: '5%',
          opacity: 0.04,
          fontSize: '80px',
        }}
      >
        🧭
      </div>
    </div>
  )
}
