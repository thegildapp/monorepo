/**
 * @generated SignedSource<<d09d5e4e01137566f42b12c4d79d9b74>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListingManagementPageQuery$variables = {
  id: string;
};
export type ListingManagementPageQuery$data = {
  readonly listing: {
    readonly " $fragmentSpreads": FragmentRefs<"ListingManagementPage_listing">;
  } | null | undefined;
};
export type ListingManagementPageQuery = {
  response: ListingManagementPageQuery$data;
  variables: ListingManagementPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ListingManagementPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "listing",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListingManagementPage_listing"
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
    "name": "ListingManagementPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "listing",
        "plural": false,
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
            "name": "description",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "31beb28695653d061f260f8b2b4f2a2f",
    "id": null,
    "metadata": {},
    "name": "ListingManagementPageQuery",
    "operationKind": "query",
    "text": "query ListingManagementPageQuery(\n  $id: ID!\n) {\n  listing(id: $id) {\n    ...ListingManagementPage_listing\n    id\n  }\n}\n\nfragment ListingManagementPage_listing on Listing {\n  id\n  title\n  description\n  price\n  images\n  city\n  state\n  createdAt\n  status\n}\n"
  }
};
})();

(node as any).hash = "a4e875a5c077c01fd55bab5d2533e0fb";

export default node;
