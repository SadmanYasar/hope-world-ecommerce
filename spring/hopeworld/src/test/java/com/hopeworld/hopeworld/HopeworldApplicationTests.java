package com.hopeworld.hopeworld;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class HopeworldApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void thisTestWillAlwaysFail() {
		org.junit.jupiter.api.Assertions.fail("This test is designed to fail");
	}

}
