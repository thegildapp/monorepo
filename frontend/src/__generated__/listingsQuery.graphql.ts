/**
 * @generated SignedSource<<5e6640eba14a67fe526b51f9a084dceb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CategoryType = "BIKES" | "BOATS" | "CARS" | "PLANES" | "%future added value";
export type listingsQuery$variables = {
  category?: CategoryType | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
};
export type listingsQuery$data = {
  readonly listings: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing">;
  }>;
};
export type listingsQuery = {
  response: listingsQuery$data;
  variables: listingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "category"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "category",
    "variableName": "category"
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "listings",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "listingsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "listings",
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
    "cacheID": "02b144ba8c3ade303df79ccb047d11e0",
    "id": null,
    "metadata": {},
    "name": "listingsQuery",
    "operationKind": "query",
    "text": "query listingsQuery(\n  $category: CategoryType\n  $limit: Int\n  $offset: Int\n) {\n  listings(category: $category, limit: $limit, offset: $offset) {\n    ...ListingCard_listing\n    id\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  category\n  images\n  city\n  state\n  createdAt\n}\n"
  }
};
})();

(node as any).hash = "c6b9d0aaf8dd76c356c3d97a35e4594c";

export default node;
