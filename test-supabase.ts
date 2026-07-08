/**
 * 测试脚本：验证单词掌握状态是否写入 Supabase
 */

import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function testWordMastery() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 配置缺失，请检查 .env.local 文件');
    console.log('需要配置：');
    console.log('  NEXT_PUBLIC_SUPABASE_URL');
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 检查 Supabase 数据...\n');

  // 1. 检查 word_mastery 表
  console.log('1️⃣ 检查 word_mastery 表:');
  const { data: masteryData, error: masteryError } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', 'personal-user')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (masteryError) {
    console.error('   ❌ 查询失败:', masteryError.message);
  } else if (!masteryData || masteryData.length === 0) {
    console.log('   ⚠️ 暂无单词掌握记录');
  } else {
    console.log(`   ✅ 找到 ${masteryData.length} 条记录`);
    console.log('   最近记录:');
    masteryData.slice(0, 5).forEach((record, i) => {
      console.log(`   ${i + 1}. word_id: ${record.word_id}, level: ${record.mastery_level}, updated: ${record.updated_at}`);
    });
  }

  // 2. 检查总记录数
  console.log('\n2️⃣ 统计信息:');
  const { count: totalCount } = await supabase
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', 'personal-user');

  const { count: masteredCount } = await supabase
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', 'personal-user')
    .gte('mastery_level', 5);

  console.log(`   总记录数: ${totalCount || 0}`);
  console.log(`   已掌握 (level >= 5): ${masteredCount || 0}`);

  // 3. 检查 words 表
  console.log('\n3️⃣ 检查 words 表:');
  const { count: wordsCount, error: wordsError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (wordsError) {
    console.error('   ❌ 查询失败:', wordsError.message);
  } else {
    console.log(`   ✅ 单词总数: ${wordsCount || 0}`);
  }

  // 4. 检查学习记录表
  console.log('\n4️⃣ 检查 word_learning_records 表:');
  const { data: recordsData, error: recordsError } = await supabase
    .from('word_learning_records')
    .select('*')
    .eq('user_id', 'personal-user')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recordsError) {
    console.log('   ⚠️ 表可能不存在或无数据');
  } else if (!recordsData || recordsData.length === 0) {
    console.log('   ⚠️ 暂无学习记录');
  } else {
    console.log(`   ✅ 找到 ${recordsData.length} 条学习记录`);
    recordsData.forEach((record, i) => {
      console.log(`   ${i + 1}. word_id: ${record.word_id}, action: ${record.action}, time: ${record.created_at}`);
    });
  }

  console.log('\n📝 测试说明:');
  console.log('   1. 在浏览器中点击"已掌握"按钮');
  console.log('   2. 运行此脚本检查 Supabase 数据');
  console.log('   3. 如果 word_mastery 表有新记录，说明同步成功');
}

testWordMastery().catch(console.error);
