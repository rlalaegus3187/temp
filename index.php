<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once('./_common.php');
$g5['title'] = "배틀";
// include_once('./_head.php');

if (!$character || $character['challenge_id'] == 0) {
    exit;
}

$challenge_log = sql_fetch("SELECT * FROM s_challenge_log WHERE challenge_id = {$character['challenge_id']}");
if (!$challenge_log) {
    exit;
}

//시드 초기화
$timestamp = strtotime($challenge_log['TIMESTAMP']);
mt_srand($timestamp);

// 스테이지 속 라운드 순서대로 불러오기
$round_sequence_query = sql_query("SELECT * FROM s_set_stage_round WHERE stage_id = {$challenge_log['stage_id']} ORDER BY sequence ASC");

// $round_sequence에 query 결과를 배열로 저장
$round_sequence = [];
while ($row = sql_fetch_array($round_sequence_query)) {
    $round_sequence[] = $row;
}

// 현재 라운드 세트 불러오기
$current_round_set = null;
foreach ($round_sequence as $round) {
    // 해당 라운드 세트 불러오기
    $round_set = sql_fetch("SELECT * FROM s_set_round_data WHERE round_id = {$round['round_id']}");

    // $challenge_log['round_id']와 같은 라운드 세트를 찾기
    if ($round['round_id'] == $challenge_log['round_id']) {
        $current_round_set = $round_set;
    }
}

// 현재 라운드 데이터 순서대로 불러오기
if ($current_round_set) {
    $round_detail_query = sql_query("SELECT * FROM s_set_data WHERE data_set_id = {$current_round_set['data_set_id']} ORDER BY sequence ASC");

    // $round_data에 라운드 데이터 정리하기
    $round_data = [];
    while ($row = sql_fetch_array($round_detail_query)) {
        if ($current_round_set['round_type'] == '0') { // round_type이 '0'인 경우
            $unit_data = sql_fetch("SELECT * FROM s_unit_stats WHERE unit_id = {$row['unit_id']}");
            $combined_data = array_merge(
                ['location_x' => $row['location_x'], 'location_y' => $row['location_y']],
                $unit_data
            );
            $round_data[] = $combined_data;
        }
    }
}

//상점 기물 리스트 불러오기
$shop_unit_query = sql_query("SELECT * FROM s_unit_stats WHERE in_shop = 1");

$shop_list = [];
while ($row = sql_fetch_array($shop_unit_query)) {
    $shop_list[] = $row;
}

$challenge_log_json = json_encode($challenge_log);
$current_round_set_json = json_encode($current_round_set);
$round_sequence_json = json_encode($round_sequence);
$round_data_json = json_encode($round_data);
$shop_list_json = json_encode($shop_list);
?>

<head>
    <!-- <link rel="stylesheet" type="text/css" href="battle.css"> -->
</head>

<body>
    <div id="top">
        <!-- 스테이지 진행 진도 -->
        <div id="stage_progress"></div>
    </div>

    <div id="bottom">
        <!-- 필드 -->
        <div id="field_info">
        </div>

        <!-- 배틀 시작 버튼 -->
        <div id="battle_start">
            배틀 시작
        </div>
        
        <div id="game_info">
            <!-- 선택된 증강 -->
            <div id="augmentation">
                증강
            </div>

            <!-- 필드 시너지 -->
            <div id="synergies">
                시너지
            </div>
        </div>

        <!-- 내 HP 정보 -->
        <div id="user_hp">
            HP 정보
        </div>

        <!-- 상점 -->
        <div id="shop">
            상점

            <div id="unit_items">
                <ul id="unit_list">
                </ul>
            </div>

            <div id="level_up">
                레벨 업
            </div>

            <div id="unit_roll">
                리롤 버튼
            </div>
        </div>


        <!-- 메신저 -->
        <div id="messenger">
            <div id="chat_expand">
            </div>
            <div class="messenger_chat_box">
                <ul class="chat_log">
                </ul>
                <div id="chat_input">
                    <textarea id="chat_msg" name="chat_msg" class="full" rows="1"></textarea>
                </div>
            </div>
        </div>

    </div>
</body>

<script>
    const challengeLog = JSON.parse('<?php echo $challenge_log_json; ?>');
    const currentRound = JSON.parse('<?php echo $current_round_set_json; ?>');
    const roundSequence = JSON.parse('<?php echo $round_sequence_json; ?>');
    const roundData = JSON.parse('<?php echo $round_data_json; ?>');
    const shopUnitList = JSON.parse('<?php echo $shop_list_json; ?>');

    window.challengeLog = challengeLog;
    window.currentRound = currentRound;
    window.roundSequence = roundSequence;
    window.roundData = roundData;
    window.shopUnitList = shopUnitList;

</script>

<script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.148.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.148.0/examples/jsm/"
        }
    }
</script>

<script type="module" src="main.js"></script>