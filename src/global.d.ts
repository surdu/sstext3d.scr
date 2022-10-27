declare module "*.md" {
	const content: string;
	export default content;
}

declare module "*.png" {
	const value: string;
	export default value;
}

declare module "*.json" {
	const value: any;
	export default value;
}
