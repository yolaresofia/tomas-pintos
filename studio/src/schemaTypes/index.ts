// Documents
import {project} from './documents/project'

// Singletons
import {about} from './singletons/about'
import {homepage} from './singletons/homepage'
import {settings} from './singletons/settings'

// Objects
import {blockContent} from './objects/blockContent'
import {externalLink} from './objects/externalLink'
import {mediaColumn} from './objects/mediaColumn'

/**
 * Export an array of all the schema types.
 * This is used in the Sanity Studio configuration.
 * https://www.sanity.io/docs/schema-types
 */
export const schemaTypes = [
  // Singletons
  homepage,
  about,
  settings,

  // Documents
  project,

  // Objects
  blockContent,
  externalLink,
  mediaColumn,
]
