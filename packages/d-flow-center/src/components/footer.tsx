import React from 'react'

import { version } from '../../package.json'

const Footer: React.FC = () => {
  return (
    <footer className="mb-2">
      <p className="text-center text-xs text-border">
        © 杭州点动星河科技有限公司 v{version}
      </p>
    </footer>
  )
}

export default Footer
