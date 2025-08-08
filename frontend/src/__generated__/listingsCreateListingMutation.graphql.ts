/**
 * @generated SignedSource<<e95e993e1aee9bca7d3ab0c57735c1d3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type CreateListingInput = {
  city: string;
  description: string;
  images: ReadonlyArray<string>;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  paymentMethodId: string;
  price: number;
  state: string;
  title: string;
};
export type listingsCreateListingMutation$variables = {
  input: CreateListingInput;
};
export type listingsCreateListingMutation$data = {
  readonly createListing: {
    readonly city: string | null | undefined;
    readonly createdAt: string;
    readonly description: string;
    readonly id: string;
    readonly images: ReadonlyArray<string>;
    readonly price: number;
    readonly seller: {
      readonly id: string;
      readonly name: string;
    };
    readonly state: string | null | undefined;
    readonly status: ListingStatus;
    readonly title: string;
    readonly updatedAt: string;
  };
};
export type listingsCreateListingMutation = {
  response: listingsCreateListingMutation$data;
  variables: listingsCreateListingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "Listing",
    "kind": "LinkedField",
    "name": "createListing",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
        "name": "status",
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
        "name": "updatedAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "seller",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsCreateListingMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "listingsCreateListingMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2a5fa265afdcd4f7741f50fa656beca1",
    "id": null,
    "metadata": {},
    "name": "listingsCreateListingMutation",
    "operationKind": "mutation",
    "text": "mutation listingsCreateListingMutation(\n  $input: CreateListingInput!\n) {\n  createListing(input: $input) {\n    id\n    title\n    description\n    price\n    images\n    city\n    state\n    status\n    createdAt\n    updatedAt\n    seller {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f60bfed529c5832faa8739f5d140c35";

export default node;
