/**

const URL = `https://${
  import.meta.env.VITE_PROJECT_ID
}.apicdn.sanity.io/v2021-10-21/data/query/production?query=`


export async function example() {
  return new Promise(async resolve => {
    let queryEncoded = encodeURIComponent(
      '*[_type == "caseStudy"]{"hi": heroImage.asset->url, "imgSection": imageSections[]{..., "images": images[].asset->url}, ...}',
    )

    let queryUrl = URL + queryEncoded
    const {result} = await fetch(queryUrl).then(res => res.json())

    return resolve(result)
  })
}

*/
const URL = `https://${
  import.meta.env.VITE_PROJECT_ID
}.apicdn.sanity.io/v2021-10-21/data/query/production?query=`

export async function getCaseStudies() {
  return new Promise(async resolve => {
    let queryEncoded = encodeURIComponent(
      '*[_type == "caseStudy" ]{"images": caseImages[]{"url": asset->url, "dimensions":asset->metadata.dimensions},  ...}| order(_createdAt asc)',
    )

    let queryUrl = URL + queryEncoded
    const {result} = await fetch(queryUrl).then(res => res.json())

    return resolve(result)
  })
}
