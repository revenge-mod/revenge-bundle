export default {
	branches: [
		"main",
		{
			name: "dev",
			prerelease: true,
		},
	],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				releaseRules: [
					{ type: "build", scope: "Needs bump", release: "patch" },
				],
			},
		],
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		[
			"@semantic-release/git",
			{
				assets: ["README.md", "CHANGELOG.md"],
				message:
					"chore: Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
		[
			"@semantic-release/exec",
			{
				prepareCmd: `bun run build --release-branch ${process.env.RELEASE_BRANCH} --build-minify`,
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{
						path: "dist/*.js",
					},
				],
				successComment: false,
			},
		],
		[
			"@saithodev/semantic-release-backmerge",
			{
				backmergeBranches: [{ from: "main", to: "dev" }],
				clearWorkspace: true,
			},
		],
	],
};
