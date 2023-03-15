import {
	dummyPaymentHandler,
	DefaultJobQueuePlugin,
	DefaultSearchPlugin,
	VendureConfig,
	LanguageCode,
	Asset,
} from "@vendure/core";
import { defaultEmailHandlers, EmailPlugin } from "@vendure/email-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import "dotenv/config";
import path from "path";
import { GoogleStorageStrategy } from "vendure-plugin-google-storage-assets";
import { nanoid } from "./nanoid";
import { HardenPlugin } from "@vendure/harden-plugin";


const IS_DEV = process.env.APP_ENV === "dev";

export const config: VendureConfig = {
	apiOptions: {
		port: 3000,
		adminApiPath: "admin-api",
		shopApiPath: "shop-api",
		// The following options are useful in development mode,
		// but are best turned off for production for security
		// reasons.
		...(IS_DEV
			? {
					adminApiPlayground: {
						settings: { "request.credentials": "include" } as any,
					},
					adminApiDebug: true,
					shopApiPlayground: {
						settings: { "request.credentials": "include" } as any,
					},
					shopApiDebug: true,
			  }
			: {}),
	},
	authOptions: {
		requireVerification: true,
		tokenMethod: ["bearer", "cookie"],
		superadminCredentials: {
			identifier: process.env.SUPERADMIN_USERNAME,
			password: process.env.SUPERADMIN_PASSWORD,
		},
		cookieOptions: {
			secret: process.env.COOKIE_SECRET,
		},
	},
	dbConnectionOptions: {
		type: "postgres",
		// See the README.md "Migrations" section for an explanation of
		// the `synchronize` and `migrations` options.
		synchronize: false,
		migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
		logging: false,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: +process.env.DB_PORT,
		ssl: true,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
	},
	paymentOptions: {
		paymentMethodHandlers: [dummyPaymentHandler],
	},
	// When adding or altering custom field definitions, the database will
	// need to be updated. See the "Migrations" section in README.md.
	customFields: {
		Channel: [
			{
				name: "isShopActive",
				type: "boolean",
				defaultValue: false,
				public: false,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Shop is Active",
					},
				],
			},
			{
				name: "openingTime",
				type: "datetime",
				public: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Opening Time",
					},
				],
				ui: {
					component: "time-form-input",
				},
			},
			{
				name: "defaultOpeningTime",
				type: "datetime",
				public: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Opening Time",
					},
				],
				ui: {
					component: "time-form-input",
				},
			},

			{
				name: "isOpen",
				type: "boolean",
				defaultValue: true,
				public: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Shop is Open",
					},
				],
			},
			{
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Processing Time (minutes)",
					},
				],
				name: "processingTime",
				type: "int",
				defaultValue: 15,
				public: true,
			},
			{
				name: "latitude",
				type: "float",
				public: true,
				defaultValue: 6.906755,
			},
			{
				name: "longitude",
				type: "float",
				public: true,
				defaultValue: 79.861244,
			},
			{
				name: "name",
				type: "string",
				public: true,
				defaultValue: "Mount Lavinia",
			},
			{
				name: "location",
				type: "string",
				public: true,
				defaultValue:
					"https://www.google.com/maps/dir/?api=1&destination=Crepe+Runner+-+Mount+Lavinia",
			},
		],
		Zone: [
			{
				name: "loyaltyPointsLimit",
				type: "int",
				public: true,
				nullable: false,
				label: [
					{
						languageCode: LanguageCode.en,

						value: "Loyalty Points Limit",
					},
				],
				defaultValue: 1000,
			},

			{
				name: "loyaltyPointsPercentage",
				type: "float",
				nullable: false,
				defaultValue: 0.1,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Loyalty Points Percentage",
					},
				],
			},
		],
		GlobalSettings: [
			{
				name: "referralLoyaltyPoints",
				type: "int",
				public: false,
				nullable: false,
				defaultValue: 250,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Referral Loyalty Points",
					},
				],
			},
		],
		OrderLine: [
			{
				name: "isCone",
				type: "boolean",
				nullable: true,
			},
		],
		ProductVariant: [
			{
				name: "pre_discount_price",
				type: "int",
				nullable: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value:
							"Pre discount price (this price will be slashed out in the UI)",
					},
				],
				ui: {
					component: "currency-form-input",
				},
			},
		],
		Address: [
			{
				name: "first_name",
				type: "string",
				nullable: false,
				defaultValue: "John",
			},
			{
				name: "uuid",
				type: "string",
				nullable: false,
				defaultValue: nanoid(),
			},
			{
				name: "last_name",
				type: "string",
				nullable: false,
				defaultValue: "Doe",
			},
			{
				name: "email",
				type: "string",
				nullable: false,
				defaultValue: "johndoe@gmail.com",
			},
			{
				name: "phone",
				type: "string",
				nullable: false,
				defaultValue: "0771234567",
			},
		],
		Order: [
			{
				name: "scheduledTime",
				type: "datetime",
				nullable: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Scheduled Time",
					},
				],
			},
			{
				name: "completedTime",
				type: "datetime",
				nullable: true,
				label: [
					{
						languageCode: LanguageCode.en,
						value: "Completed Time",
					},
				],
			},
			// {
			//     name: 'channel',
			//     type: 'relation',
			//     entity: Channel,
			//     // may be omitted if the entity name matches the GraphQL type name,
			//     // which is true for all built-in entities.
			//     graphQLType: 'Channel',
			//     // Whether to "eagerly" load the relation
			//     // See https://typeorm.io/#/eager-and-lazy-relations
			//     eager: true,
			// },
		],
		Customer: [
			{
				name: "referredBy",
				type: "string",
				nullable: true,
				internal: true,
			},
			{
				name: "isReferralCompleted",
				type: "boolean",
				internal: true,
				nullable: true,
			},
			{
				name: "referredCode",
				type: "string",
				nullable: true,
			},
			{
				name: "referralCode",
				type: "string",
				readonly: true,
				public: true,
				nullable: false,
				defaultValue: nanoid(6),
			},
			{
				name: "loyaltyPoints",
				type: "int",
				readonly: true,
				public: true,
				defaultValue: 0,
				nullable: false,
			},
			{
				name: "dob",
				type: "datetime",
				nullable: true,
			},
			{
				name: "gender",
				type: "string",
				nullable: true,
			},
		],
		Promotion: [
			{
				name: "image",
				type: "relation",
				entity: Asset,
				// may be omitted if the entity name matches the GraphQL type name,
				// which is true for all built-in entities.
				graphQLType: "Asset",
				// Whether to "eagerly" load the relation
				// See https://typeorm.io/#/eager-and-lazy-relations
				eager: true,
			},
			{
				name: "description",
				type: "string",
				nullable: false,
				defaultValue: "",
				ui: {
					component: "textarea-form-input",
				},
			},
		],
		Facet: [
			// {
			//     name: 'color1',
			//     type: 'string',
			//     label: [{ languageCode: LanguageCode.en, value: 'Color 1' }],
			//     validate: (value: string) => {
			//         const regex: RegExp = /^#[0-9a-fA-F]{6}$/;
			//         if (!regex.test(value)) {
			//             return 'Invalid color code';
			//         }
			//     },
			// },
			// {
			//     name: 'color2',
			//     type: 'string',
			//     label: [{ languageCode: LanguageCode.en, value: 'Color 2' }],
			//     validate: (value: string) => {
			//         const regex: RegExp = /^#[0-9a-fA-F]{6}$/;
			//         if (!regex.test(value)) {
			//             return 'Invalid color code';
			//         }
			//     },
			// },
		],
		FacetValue: [
			{
				name: "color1",
				type: "string",
				label: [{ languageCode: LanguageCode.en, value: "Color 1" }],
				validate: (value: string) => {
					const regex: RegExp = /^#[0-9a-fA-F]{6}$/;
					if (!regex.test(value)) {
						return "Invalid color code";
					}
				},
			},
			{
				name: "color2",
				type: "string",
				label: [{ languageCode: LanguageCode.en, value: "Color 2" }],
				validate: (value: string) => {
					const regex: RegExp = /^#[0-9a-fA-F]{6}$/;
					if (!regex.test(value)) {
						return "Invalid color code";
					}
				},
			},
		],
	},
	plugins: [
		AssetServerPlugin.init({
			storageStrategyFactory: () =>
				new GoogleStorageStrategy({ bucketName: "scaling-test-crepe" }),
			route: "assets",
			assetUploadDir: "/tmp/vendure/assets",
		}),
		HardenPlugin.init({
			maxQueryComplexity: 500,
			apiMode: IS_DEV ? "dev" : "prod",
		}),
		// ...
		DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
		DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
		EmailPlugin.init({
			devMode: true,
			outputPath: path.join(__dirname, "../static/email/test-emails"),
			route: "mailbox",
			handlers: defaultEmailHandlers,
			templatePath: path.join(__dirname, "../static/email/templates"),
			globalTemplateVars: {
				// The following variables will change depending on your storefront implementation.
				// Here we are assuming a storefront running at http://localhost:8080.
				fromAddress: '"example" <noreply@example.com>',
				verifyEmailAddressUrl: "http://localhost:8080/verify",
				passwordResetUrl: "http://localhost:8080/password-reset",
				changeEmailAddressUrl:
					"http://localhost:8080/verify-email-address-change",
			},
		}),
		AdminUiPlugin.init({
			route: "admin",
			port: 3002,
		}),
	],
};
