/**
 * @generated SignedSource<<56d4fa975a97128923ea4dbd565ea85a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type EditListingPage_listing$data = {
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly status: ListingStatus;
  readonly title: string;
  readonly " $fragmentType": "EditListingPage_listing";
};
export type EditListingPage_listing$key = {
  readonly " $data"?: EditListingPage_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditListingPage_listing">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditListingPage_listing",
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
  "type": "Listing",
  "abstractKey": null
};

(node as any).hash = "a4662fff01862b75424e99ce75a312c0";

export default node;
