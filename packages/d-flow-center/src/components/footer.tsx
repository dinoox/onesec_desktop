import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="mb-2 z-50">
      <p className="text-center text-xs text-black/24">
        © {new Date().toLocaleDateString()}
      </p>
    </footer>
  )
}

export default Footer
