export default async function handler(req, res) {
  if (req.query.token !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const { path } = req.body
    await res.revalidate(path)
    return res.json({ revalidated: true })
  } catch (error) {
    console.warn(error.toString())
    return res.status(500).json({ error: 'Failed to revalidate' })
  }
}
