export const deskStructure = S =>
  S.list()
    .title('Base')
    .items([
      S.listItem()
        .title('Case Study')
        .child(S.document().schemaType('study').documentId('study')),
      ...S.documentTypeListItems().filter(
        listItem => !['caseStudy'].includes(listItem.getId()),
      ),
    ])
