/**
 * @generated SignedSource<<d66e59cf471dc7ac03a5691c6b36b225>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditListingPageQuery$variables = {
  id: string;
};
export type EditListingPageQuery$data = {
  readonly listing: {
    readonly " $fragmentSpreads": FragmentRefs<"EditListingPage_listing">;
  } | null | undefined;
};
export type EditListingPageQuery = {
  response: EditListingPageQuery$data;
  variables: EditListingPageQuery$variables;
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
    "name": "EditListingPageQuery",
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
            "name": "EditListingPage_listing"
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
    "name": "EditListingPageQuery",
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
    "cacheID": "8cf37fed6d28e8b9f7151af28893f825",
    "id": null,
    "metadata": {},
    "name": "EditListingPageQuery",
    "operationKind": "query",
    "text": "query EditListingPageQuery(\n  $id: ID!\n) {\n  listing(id: $id) {\n    ...EditListingPage_listing\n    id\n  }\n}\n\nfragment EditListingPage_listing on Listing {\n  id\n  title\n  description\n  price\n  images\n  city\n  state\n  createdAt\n  status\n}\n"
  }
};
})();

(node as any).hash = "65900409b053456807289ed4429c6f72";

export default node;
