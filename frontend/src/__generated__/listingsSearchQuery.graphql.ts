/**
 * @generated SignedSource<<d16305dc1bd9ed9cc671ef452aa60d21>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CategoryType = "BIKES" | "BOATS" | "CARS" | "PLANES" | "%future added value";
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
  category?: CategoryType | null | undefined;
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
  "name": "category"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filters"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
},
v5 = [
  {
    "kind": "Variable",
    "name": "category",
    "variableName": "category"
  },
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
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
      (v4/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "listingsSearchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
            "name": "category",
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
    "cacheID": "1b3dbb43dabc821aac53f4cea7138a08",
    "id": null,
    "metadata": {},
    "name": "listingsSearchQuery",
    "operationKind": "query",
    "text": "query listingsSearchQuery(\n  $query: String!\n  $category: CategoryType\n  $limit: Int\n  $offset: Int\n  $filters: SearchFilters\n) {\n  searchListings(query: $query, category: $category, limit: $limit, offset: $offset, filters: $filters) {\n    ...ListingCard_listing\n    id\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  category\n  images\n  city\n  state\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "787004962f588e7158e0776d8905c16e";

export default node;
