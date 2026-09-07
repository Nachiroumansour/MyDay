CREATE TYPE "public"."statut_evenement" AS ENUM('brouillon', 'publie', 'archive');--> statement-breakpoint
CREATE TYPE "public"."statut_gabarit" AS ENUM('brouillon', 'actif', 'archive');--> statement-breakpoint
CREATE TYPE "public"."type_evenement" AS ENUM('mariage', 'bapteme', 'anniversaire');--> statement-breakpoint
CREATE TABLE "ceremonies" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"rang" integer NOT NULL,
	"nom" text NOT NULL,
	"debute_le" timestamp with time zone NOT NULL,
	"termine_le" timestamp with time zone,
	"lieu" text NOT NULL,
	"adresse" text,
	"repere" text,
	"latitude" double precision,
	"longitude" double precision,
	"code_vestimentaire" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "evenements" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"secret_brouillon" text NOT NULL,
	"titre" text NOT NULL,
	"type_evenement" "type_evenement" NOT NULL,
	"gabarit_id" text NOT NULL,
	"valeurs_champs" jsonb NOT NULL,
	"photo_url" text,
	"recadrage" jsonb,
	"code_vestimentaire" text,
	"mot_des_hotes" text,
	"statut" "statut_evenement" DEFAULT 'brouillon' NOT NULL,
	"publie_le" timestamp with time zone,
	"telephone_hote" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evenements_slug_unique" UNIQUE("slug"),
	CONSTRAINT "evenements_secret_brouillon_unique" UNIQUE("secret_brouillon")
);
--> statement-breakpoint
CREATE TABLE "gabarits" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"type_evenement" "type_evenement" NOT NULL,
	"source_svg" text NOT NULL,
	"apercu_url" text,
	"champs" jsonb NOT NULL,
	"etiquettes" text[] DEFAULT '{}' NOT NULL,
	"prix" integer NOT NULL,
	"statut" "statut_gabarit" DEFAULT 'brouillon' NOT NULL,
	"nb_ventes" integer DEFAULT 0 NOT NULL,
	"graphiste_id" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gabarits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "graphistes" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"bio" text,
	"photo_url" text,
	"contact" text NOT NULL,
	"part_revenu" numeric(5, 2) NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"nom_complet" text NOT NULL,
	"telephone" text,
	"jeton" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invites_jeton_unique" UNIQUE("jeton")
);
--> statement-breakpoint
CREATE TABLE "reponses" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"invite_id" text,
	"nom" text NOT NULL,
	"telephone" text NOT NULL,
	"present" boolean NOT NULL,
	"nb_personnes" integer DEFAULT 1 NOT NULL,
	"ceremonie_ids" text[] DEFAULT '{}' NOT NULL,
	"message" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reponses_invite_id_unique" UNIQUE("invite_id")
);
--> statement-breakpoint
ALTER TABLE "ceremonies" ADD CONSTRAINT "ceremonies_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_gabarit_id_gabarits_id_fk" FOREIGN KEY ("gabarit_id") REFERENCES "public"."gabarits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gabarits" ADD CONSTRAINT "gabarits_graphiste_id_graphistes_id_fk" FOREIGN KEY ("graphiste_id") REFERENCES "public"."graphistes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reponses" ADD CONSTRAINT "reponses_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reponses" ADD CONSTRAINT "reponses_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ceremonies_evenement_rang" ON "ceremonies" USING btree ("evenement_id","rang");--> statement-breakpoint
CREATE INDEX "evenements_statut" ON "evenements" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "gabarits_type_statut" ON "gabarits" USING btree ("type_evenement","statut");--> statement-breakpoint
CREATE INDEX "invites_evenement" ON "invites" USING btree ("evenement_id");--> statement-breakpoint
CREATE INDEX "reponses_evenement_present" ON "reponses" USING btree ("evenement_id","present");