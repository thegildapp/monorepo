/**
 * @generated SignedSource<<3fc2296c962520536688da6eb154d6e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchFilters = {
  location?: string | null | undefined;
  make?: string | null | undefined;
  model?: string | null | undefined;
  priceMax?: number | null | undefined;
  priceMin?: number | null | undefined;
  yearMax?: number | null | undefined;
  yearMin?: number | null | undefined;
};
export type listingsSearchQuery$variables = {
  filters?: SearchFilters | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  query: string;
};
export type listingsSearchQuery$data = {
  readonly searchListings: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing">;
  }>;
};
export type listingsSearchQuery = {
  response: listingsSearchQuery$data;
  variables: listingsSearchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filters"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filters",
    "variableName": "filters"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "query",
    "variableName": "query"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "searchListings",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListingCard_listing"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "listingsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "searchListings",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "price",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "images",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "city",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0b9c47760a03d59fcc1cfbd64f0b3aa3",
    "id": null,
    "metadata": {},
    "name": "listingsSearchQuery",
    "operationKind": "query",
    "text": "query listingsSearchQuery(\n  $query: String!\n  $limit: Int\n  $offset: Int\n  $filters: SearchFilters\n) {\n  searchListings(query: $query, limit: $limit, offset: $offset, filters: $filters) {\n    ...ListingCard_listing\n    id\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  city\n  state\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "066de7787cb3dc7e16ffe3896ac5c052";

export default node;
