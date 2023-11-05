module.exports = {
    preset: '@shelf/jest-mongodb',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['./test/setup.ts'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: './test/reports',
                outputName: 'coverage'
            }
        ]
    ],
    coveragePathIgnorePatterns: [ '/node_modules/', '/__tests__/fixtures/', '/exceptions/', '/libs/']
};