package com.model.user;

import com.model.authority.AuthorityEntity;
import com.model.google.GoogleUser;
import com.model.yandex.YandexUser;

import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "app_users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "user_authority", joinColumns = { @JoinColumn(name = "user_id") },
            inverseJoinColumns = { @JoinColumn(name = "authority_id") })
    private Set<AuthorityEntity> authorities;

    @OneToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "google_user_id", referencedColumnName = "id")
    private GoogleUser googleUser;

    @OneToOne(cascade=CascadeType.ALL)
    @JoinColumn(name = "yandex_user_id", referencedColumnName = "id")
    private YandexUser yandexUser;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<AuthorityEntity> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<AuthorityEntity> authorities) {
        this.authorities = authorities;
    }

    public GoogleUser getGoogleUser() {
        return googleUser;
    }

    public void setGoogleUser(GoogleUser googleUser) {
        this.googleUser = googleUser;
    }

    public YandexUser getYandexUser() {
        return yandexUser;
    }

    public void setYandexUser(YandexUser yandexUser) {
        this.yandexUser = yandexUser;
    }
}
