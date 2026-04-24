package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.*;
import com.kargo.api.model.Transaction;
import com.kargo.api.model.User;
import com.kargo.api.model.Wallet;
import com.kargo.api.repository.TransactionRepository;
import com.kargo.api.repository.UserRepository;
import com.kargo.api.repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletRepository wallets;
    private final TransactionRepository txs;
    private final UserRepository users;

    public WalletController(WalletRepository wallets, TransactionRepository txs, UserRepository users) {
        this.wallets = wallets;
        this.txs = txs;
        this.users = users;
    }

    @GetMapping
    public ResponseEntity<WalletDto> me(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Wallet w = wallets.findByUser(principal).orElseGet(() -> wallets.save(Wallet.builder().user(principal).build()));
        return ResponseEntity.ok(WalletDto.of(w));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> list(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(txs.findByUserOrderByCreatedAtDesc(principal).stream().map(TransactionDto::of).toList());
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topup(@AuthenticationPrincipal User principal, @RequestBody TopupRequest body) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.amountMru() < 1000) return ResponseEntity.badRequest().body(Map.of("error", "amount_too_low"));
        Wallet w = wallets.findByUser(principal).orElseGet(() -> wallets.save(Wallet.builder().user(principal).build()));
        if (w.isKillSwitch()) return ResponseEntity.status(423).body(Map.of("error", "kill_switch"));
        w.setBalanceMru(w.getBalanceMru() + body.amountMru());
        wallets.save(w);
        Transaction t = txs.save(Transaction.builder()
                .user(principal)
                .type("topup_" + (body.source() == null ? "card" : body.source()))
                .amountMru(body.amountMru())
                .counterparty(body.source() == null ? "Carte" : body.source())
                .reference("TOP-" + System.currentTimeMillis())
                .build());
        return ResponseEntity.ok(Map.of("wallet", WalletDto.of(w), "transaction", TransactionDto.of(t)));
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@AuthenticationPrincipal User principal, @RequestBody TransferRequest body) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.amountMru() <= 0) return ResponseEntity.badRequest().body(Map.of("error", "amount_invalid"));
        Wallet from = wallets.findByUser(principal).orElseThrow();
        if (from.isKillSwitch()) return ResponseEntity.status(423).body(Map.of("error", "kill_switch"));
        if (body.amountMru() > from.getPerTxLimitMru()) return ResponseEntity.status(403).body(Map.of("error", "per_tx_limit"));
        if (from.getBalanceMru() < body.amountMru()) return ResponseEntity.status(402).body(Map.of("error", "insufficient_funds"));

        from.setBalanceMru(from.getBalanceMru() - body.amountMru());
        wallets.save(from);

        users.findByPhone(body.toPhone()).ifPresent(target -> {
            Wallet toW = wallets.findByUser(target).orElseGet(() -> wallets.save(Wallet.builder().user(target).build()));
            toW.setBalanceMru(toW.getBalanceMru() + body.amountMru());
            wallets.save(toW);
            txs.save(Transaction.builder()
                    .user(target).type("p2p_received").amountMru(body.amountMru())
                    .counterparty(principal.getPhone()).reference("P2P-" + System.currentTimeMillis())
                    .note(body.note()).build());
        });

        Transaction t = txs.save(Transaction.builder()
                .user(principal).type("p2p_sent").amountMru(-body.amountMru())
                .counterparty(body.toPhone()).reference("P2P-" + System.currentTimeMillis())
                .note(body.note()).build());
        return ResponseEntity.ok(Map.of("wallet", WalletDto.of(from), "transaction", TransactionDto.of(t)));
    }
}
