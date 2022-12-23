module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2,
            'always', [
                'feat',//新功能
                'fix',//bug
                'refactor',//重构
                'optimize',//优化
                'style',//格式
                'docs',//文档
                'chore',//辅助工具变动
                'test'//测试案例改动
            ]]
    }
}
