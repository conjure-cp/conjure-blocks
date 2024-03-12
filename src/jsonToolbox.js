// A variation of code from https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#0

export const jsonToolbox = {
  'kind': 'categoryToolbox',
  'contents': [ {
    'kind' : 'category',
    'name' : 'Values',
    'contents': [
    {
      'kind': 'block',
      'type': 'object'
    },
    {
      'kind': 'block',
      'type': 'member'
    },
    {
      'kind': 'block',
      'type': 'math_number'
    },
    {
      'kind': 'block',
      'type': 'text'
    },
    {
      'kind': 'block',
      'type': 'logic_boolean'
    },
    {
      'kind': 'block',
      'type': 'logic_null'
    },
    {
      'kind': 'block',
      'type': 'lists_create_with'
    },
  ]}, 
  {
    'kind': 'category',
    'name': 'Variables',
    'custom': 'GET_VARIABLE'
  }
]
}