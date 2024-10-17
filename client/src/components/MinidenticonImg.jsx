import { PropTypes } from 'prop-types'
import { minidenticon } from 'minidenticons'
import { useMemo } from 'react'

const MinidenticonImg = ({ username, saturation, lightness, ...props }) => {
  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness]
  )
  return (<img src={svgURI} alt={username} className='bg-white rounded-full mr-2 hover:bg-black mb-3' {...props} />)
}

export default MinidenticonImg;

MinidenticonImg.propTypes = {
  username:PropTypes.string,
  saturation:PropTypes.int,
  lightness:PropTypes.int
}