DROP TABLE IF EXISTS `level_upgrade_logs`;
DROP TABLE IF EXISTS `member_coupons`;
DROP TABLE IF EXISTS `point_flows`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `levels`;
DROP TABLE IF EXISTS `coupons`;

CREATE TABLE `levels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '等级名称',
  `min_points` INT NOT NULL DEFAULT 0 COMMENT '最低积分',
  `max_points` INT NULL DEFAULT NULL COMMENT '最高积分',
  `discount` DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT '折扣(%)',
  `description` VARCHAR(255) NULL DEFAULT '' COMMENT '等级描述',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';

CREATE TABLE `members` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `member_no` VARCHAR(32) NOT NULL COMMENT '会员编号',
  `name` VARCHAR(50) NOT NULL COMMENT '会员姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号码',
  `email` VARCHAR(100) NULL DEFAULT '' COMMENT '邮箱',
  `points` INT NOT NULL DEFAULT 0 COMMENT '当前积分',
  `level_id` INT NULL DEFAULT NULL COMMENT '等级ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `remark` VARCHAR(255) NULL DEFAULT '' COMMENT '备注',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_member_no` (`member_no`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_level_id` (`level_id`),
  CONSTRAINT `fk_members_level` FOREIGN KEY (`level_id`) REFERENCES `levels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

CREATE TABLE `point_flows` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `flow_no` VARCHAR(32) NOT NULL COMMENT '流水号',
  `member_id` INT NOT NULL COMMENT '会员ID',
  `points` INT NOT NULL COMMENT '积分变化(正数增加,负数减少)',
  `type` TINYINT NOT NULL COMMENT '类型: 1-获取, 2-消耗',
  `balance` INT NOT NULL COMMENT '变更后余额',
  `reason` VARCHAR(255) NOT NULL COMMENT '变更原因',
  `operator` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '操作人',
  `flow_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_flow_no` (`flow_no`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_flow_time` (`flow_time`),
  CONSTRAINT `fk_flows_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分流水表';

CREATE TABLE `level_upgrade_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `flow_no` VARCHAR(32) NOT NULL COMMENT '流水号',
  `member_id` INT NOT NULL COMMENT '会员ID',
  `old_level_id` INT NULL DEFAULT NULL COMMENT '原等级ID',
  `new_level_id` INT NOT NULL COMMENT '新等级ID',
  `upgrade_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '升级时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_flow_no` (`flow_no`),
  KEY `idx_member_id` (`member_id`),
  CONSTRAINT `fk_upgrade_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='等级升级日志表';

CREATE TABLE `coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `code` VARCHAR(50) NOT NULL COMMENT '优惠券编码',
  `type` TINYINT NOT NULL COMMENT '类型: 1-满减, 2-折扣',
  `value` DECIMAL(10,2) NOT NULL COMMENT '面值(金额或折扣率)',
  `min_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '最低使用金额',
  `total_quantity` INT NOT NULL DEFAULT 100 COMMENT '总数量',
  `used_quantity` INT NOT NULL DEFAULT 0 COMMENT '已领取数量',
  `start_date` DATE NOT NULL COMMENT '有效期开始',
  `end_date` DATE NOT NULL COMMENT '有效期结束',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-停用',
  `description` VARCHAR(500) NULL DEFAULT '' COMMENT '使用说明',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券模板表';

CREATE TABLE `member_coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL COMMENT '券码',
  `coupon_id` INT NOT NULL COMMENT '优惠券模板ID',
  `member_id` INT NOT NULL COMMENT '会员ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-未使用, 1-已使用, 2-已过期',
  `issued_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发放时间',
  `valid_from` DATE NOT NULL COMMENT '有效期开始',
  `valid_to` DATE NOT NULL COMMENT '有效期结束',
  `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
  `issued_by` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '发放人',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  CONSTRAINT `fk_mc_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mc_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员优惠券表';
